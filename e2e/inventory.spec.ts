import { expect, test, type Page } from "@playwright/test";

const EMAIL = process.env.ADMIN_EMAIL ?? "admin@leovorno.com";
const PASSWORD = process.env.ADMIN_PASSWORD ?? "ChangeMe!2026";
const BRAND_SLUG = process.env.BRAND_SLUG ?? "leovorno";
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3011/api";

async function loginAsAdmin(page: Page): Promise<void> {
  await page.goto("/login");
  await page.locator("#email").fill(EMAIL);
  await page.locator("#password").fill(PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/admin\/dashboard/, { timeout: 20_000 });
  await expect
    .poll(async () => page.evaluate(() => localStorage.getItem("leovorno-auth-token")))
    .not.toBeNull();
}

async function openInventory(page: Page): Promise<void> {
  await page.goto("/admin/inventory");

  const stockHeading = page.getByRole("heading", { name: "Stock list" });
  const chooseStore = page.getByRole("heading", { name: "Choose a store" });

  await expect(stockHeading.or(chooseStore)).toBeVisible({ timeout: 20_000 });

  if (await chooseStore.isVisible().catch(() => false)) {
    await page
      .getByRole("button")
      .filter({ hasText: /Open inventory/i })
      .first()
      .click();
  }

  await expect(stockHeading).toBeVisible({ timeout: 20_000 });
}

async function goTab(page: Page, label: string): Promise<void> {
  await page
    .locator("nav")
    .getByRole("button", { name: label, exact: true })
    .click();
}

test.describe("Admin inventory", () => {
  test.beforeAll(async ({ request }) => {
    const health = await request.get(`${API_URL}/health`);
    expect(
      health.ok(),
      `API health failed at ${API_URL}/health — start smoke API on 3011`,
    ).toBeTruthy();
  });

  test.beforeEach(async ({ page }) => {
    await page.addInitScript((slug) => {
      window.localStorage.setItem("marina-admin-brand", slug);
    }, BRAND_SLUG);

    await page.goto("/login");
    await page.evaluate(() => {
      window.localStorage.removeItem("leovorno-auth-token");
      window.localStorage.removeItem("leovorno-auth-user");
    });
  });

  test("login → inventory tabs, stock create, movements, supplier, PO", async ({
    page,
  }) => {
    const suffix = Date.now().toString(36);
    const stockName = `E2E Flour ${suffix}`;
    const supplierName = `E2E Supplier ${suffix}`;

    await loginAsAdmin(page);
    await openInventory(page);

    // --- Stock list: list + create item ---
    await expect(page.getByText(/active · .* low stock/i)).toBeVisible();
    await expect(page.getByText("Current stock")).toBeVisible();
    await expect(page.getByText("Add items manually")).toBeVisible();

    const createTable = page
      .locator("section")
      .filter({ hasText: "Add items manually" })
      .locator("tbody tr")
      .first();
    await createTable.getByPlaceholder("e.g. Mozzarella").fill(stockName);
    await createTable.getByPlaceholder("Optional").fill(`E2E-${suffix}`);
    await page.getByRole("button", { name: /Save items/ }).click();
    await expect(page.getByText(/Added \d+ item/i)).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByText(stockName).first()).toBeVisible();

    // --- Receive ---
    await goTab(page, "Receive");
    await expect(page.getByRole("heading", { name: "Receive" })).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Save receive/ }),
    ).toBeVisible();

    const receiveRow = page.locator("tbody tr").filter({ hasText: stockName });
    await expect(receiveRow).toBeVisible();
    const receiveInputs = receiveRow.locator('input[inputmode="decimal"]');
    await receiveInputs.nth(0).fill("5");
    await receiveInputs.nth(1).fill("2.50");
    await page.getByRole("button", { name: /Save receive/ }).click();
    await expect(page.getByText(/Received \d+ line/i)).toBeVisible({
      timeout: 15_000,
    });

    // --- Waste ---
    await goTab(page, "Waste");
    await expect(page.getByRole("heading", { name: "Waste" })).toBeVisible();
    const wasteRow = page.locator("tbody tr").filter({ hasText: stockName });
    await wasteRow.locator('input[inputmode="decimal"]').fill("1");
    await page.getByRole("button", { name: /Save waste/ }).click();
    await expect(page.getByText(/Waste saved for \d+ line/i)).toBeVisible({
      timeout: 15_000,
    });

    // --- Adjust ---
    await goTab(page, "Adjust");
    await expect(page.getByRole("heading", { name: "Adjust" })).toBeVisible();
    const adjustRow = page.locator("tbody tr").filter({ hasText: stockName });
    await adjustRow.locator('input[inputmode="decimal"]').fill("0.5");
    await page.getByRole("button", { name: /Save adjust/ }).click();
    await expect(page.getByText(/Adjust saved for \d+ line/i)).toBeVisible({
      timeout: 15_000,
    });

    // --- Count ---
    await goTab(page, "Count");
    await expect(page.getByRole("heading", { name: "Count" })).toBeVisible();
    const countRow = page.locator("tbody tr").filter({ hasText: stockName });
    await countRow.locator('input[inputmode="decimal"]').fill("4");
    await page.getByRole("button", { name: /Save count/ }).click();
    await expect(page.getByText(/Count saved for \d+ line/i)).toBeVisible({
      timeout: 15_000,
    });

    // --- Low stock ---
    await goTab(page, "Low stock");
    await expect(
      page.getByRole("heading", { name: "Low stock", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Email alert now" }),
    ).toBeVisible();
    await expect(page.getByText("Low stock items")).toBeVisible();

    // --- History ---
    await goTab(page, "History");
    await expect(page.getByRole("heading", { name: "History" })).toBeVisible();

    // --- Statistics ---
    await goTab(page, "Statistics");
    await expect(
      page.getByRole("heading", { name: "Statistics" }),
    ).toBeVisible();
    await expect(page.getByText("Low stock now")).toBeVisible();

    // --- Recipes ---
    await goTab(page, "Recipes");
    await expect(page.getByRole("heading", { name: "Recipes" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Menu items" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Toppings" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Crusts" })).toBeVisible();

    // --- Suppliers: form + save (create form opens by default) ---
    await goTab(page, "Suppliers");
    await expect(
      page.getByRole("heading", { name: "Suppliers" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Add supplier", exact: true }),
    ).toBeVisible();
    await page.getByPlaceholder("Supplier name").fill(supplierName);
    await page
      .getByPlaceholder("orders@supplier.com")
      .fill(`e2e-${suffix}@example.com`);
    await page.getByRole("button", { name: "Save supplier" }).click();
    await expect(page.getByText(`Added "${supplierName}"`)).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByText(supplierName).first()).toBeVisible();

    // --- Purchase orders: create draft ---
    await goTab(page, "Purchase orders");
    await expect(
      page.getByRole("heading", { name: "Purchase orders" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "New PO" }).click();
    await expect(
      page.getByRole("heading", { name: "New purchase order" }),
    ).toBeVisible();
    await page
      .locator("select")
      .filter({ hasText: "Select supplier" })
      .selectOption({ label: supplierName });

    const poRow = page.locator("tbody tr").filter({ hasText: stockName });
    await expect(poRow).toBeVisible();
    const poInputs = poRow.locator('input[inputmode="decimal"]');
    await poInputs.nth(0).fill("2");
    await poInputs.nth(1).fill("3.5");
    await page.getByRole("button", { name: "Create draft" }).click();
    await expect(page.getByText(/Draft PO #/i)).toBeVisible({ timeout: 15_000 });
    await expect(
      page.getByRole("heading", { name: "Purchase orders" }),
    ).toBeVisible();
    await expect(page.getByText(/DRAFT/i).first()).toBeVisible();
  });
});
