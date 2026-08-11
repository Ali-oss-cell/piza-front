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
    .poll(async () =>
      page.evaluate(() => localStorage.getItem("leovorno-auth-token")),
    )
    .not.toBeNull();
}

async function openStoreDashboard(page: Page): Promise<void> {
  await page.goto("/admin/dashboard");

  const overview = page.getByRole("heading", { name: "Overview", exact: true });
  const yourStores = page.getByRole("heading", { name: "Your stores" });

  await expect(overview.or(yourStores)).toBeVisible({ timeout: 20_000 });

  if (await yourStores.isVisible().catch(() => false)) {
    await page
      .getByRole("button")
      .filter({ hasText: /Open dashboard/i })
      .first()
      .click();
  }

  await expect(
    page.getByRole("heading", { name: "Overview", exact: true }),
  ).toBeVisible({ timeout: 20_000 });
  await expect(page.getByText("Total Revenue")).toBeVisible();
}

async function goNav(page: Page, label: string): Promise<void> {
  await page
    .locator("nav")
    .getByRole("button", { name: label, exact: true })
    .click();
}

test.describe("Admin dashboard", () => {
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

  test("login → walk store views + create crust", async ({ page }) => {
    const suffix = Date.now().toString(36);
    const crustName = `E2E Crust ${suffix}`;

    await loginAsAdmin(page);
    await openStoreDashboard(page);

    // --- Overview ---
    await expect(page.getByText("Total Revenue")).toBeVisible();
    await expect(page.getByText("Live Orders Pending")).toBeVisible();
    await expect(page.getByText("Average Order Value")).toBeVisible();
    await expect(page.getByText("Active Store Locations")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Recent Orders" }),
    ).toBeVisible();

    // --- Live Orders ---
    await goNav(page, "Live Orders");
    await expect(
      page.getByRole("heading", { name: "Live Orders", exact: true }),
    ).toBeVisible();
    for (const tab of [
      "Pending",
      "Preparing",
      "Baking",
      "Out for Delivery",
      "Delivered",
    ]) {
      await expect(page.getByRole("button", { name: tab, exact: true })).toBeVisible();
    }
    await page.getByRole("button", { name: "Delivered", exact: true }).click();
    await expect(
      page.getByText(/No orders in this stage|Advance to/i).first(),
    ).toBeVisible();

    // --- Menu Management ---
    await goNav(page, "Menu Management");
    await expect(
      page.getByRole("heading", { name: "Menu Management" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Add Menu Item" }),
    ).toBeVisible();

    // --- Menu Categories ---
    await goNav(page, "Menu Categories");
    await expect(
      page.getByRole("heading", { name: "Menu Categories" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Add Category" }),
    ).toBeVisible();

    // --- Toppings ---
    await goNav(page, "Toppings");
    await expect(
      page.getByRole("heading", { name: "Toppings Management" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Add Topping" }),
    ).toBeVisible();

    // --- Ingredients ---
    await goNav(page, "Ingredients");
    await expect(
      page.getByRole("heading", { name: "Ingredients", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Categories" }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "Catalog" })).toBeVisible();

    // --- Topping Categories ---
    await goNav(page, "Topping Categories");
    await expect(
      page.getByRole("heading", { name: "Topping Categories" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Add Category" }),
    ).toBeVisible();

    // --- Crusts (light mutate) ---
    await goNav(page, "Crusts");
    await expect(
      page.getByRole("heading", { name: "Crust Management" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Add Crust" }).click();
    const crustDialog = page.getByRole("dialog");
    await expect(
      crustDialog.getByRole("heading", { name: "Add Crust" }),
    ).toBeVisible();
    await crustDialog.locator("input").first().fill(crustName);
    await crustDialog.getByRole("button", { name: "Save" }).click();
    await expect(crustDialog).toBeHidden({ timeout: 15_000 });
    await expect(page.getByText(crustName)).toBeVisible();

    // --- Deals ---
    await goNav(page, "Deals");
    await expect(
      page.getByRole("heading", { name: "Deals & Promotions" }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Add Deal" })).toBeVisible();

    // --- Payments (read-only assert — do not save/pair) ---
    await goNav(page, "Payments");
    await expect(
      page.getByRole("heading", { name: "Payments", exact: true }),
    ).toBeVisible();
    await expect(page.getByText("Cash enabled")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Save payment settings" }),
    ).toBeVisible();

    // --- Team (open invite dialog, cancel — do not send) ---
    await goNav(page, "Team");
    await expect(
      page.getByRole("heading", { name: "Team", exact: true }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Invite Member" }).click();
    await expect(
      page.getByRole("heading", { name: /Invite Team Member/i }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Cancel" }).click();

    // --- Locations ---
    await goNav(page, "Locations");
    await expect(
      page.getByRole("heading", { name: "Locations", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Add Location" }),
    ).toBeVisible();

    // --- System Settings (read-only — do not save/suspend) ---
    await goNav(page, "System Settings");
    await expect(
      page.getByRole("heading", { name: "System Settings" }),
    ).toBeVisible();
    await expect(page.getByText("Store name")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Save Settings" }),
    ).toBeVisible();
  });
});
