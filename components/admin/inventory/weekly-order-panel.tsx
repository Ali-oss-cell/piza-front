"use client";

import {
  AlertTriangle,
  ArrowLeft,
  Download,
  FileText,
  Loader2,
  PackagePlus,
  Plus,
  Printer,
  Save,
  Send,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { inventorySelectClassName } from "@/components/admin/inventory/inventory-utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  createWeeklyOrder,
  deleteWeeklyOrder,
  downloadWeeklyOrderPdf,
  fetchSuppliers,
  fetchWeeklyOrder,
  fetchWeeklyOrders,
  previewWeeklyOrder,
  seedWeeklySheetCatalog,
  sendWeeklyOrder,
  updateWeeklyOrder,
} from "@/lib/admin-api";
import {
  adminDialogSurface,
  dashboardGlass,
  primaryText,
  secondaryText,
} from "@/lib/theme-classes";
import { cn } from "@/lib/utils";
import type {
  StockUnit,
  Supplier,
  UpdateWeeklyOrderPayload,
  WeeklyOrder,
  WeeklyOrderLine,
  WeeklyOrderStatus,
  WeeklyOrderSummary,
  WeeklyOrderVendorPreview,
} from "@/types/inventory";
import { STOCK_UNIT_LABELS } from "@/types/inventory";

interface WeeklyOrderPanelProps {
  token: string;
  brandSlug: string;
  onStockRefresh?: () => void;
}

type LineDraft = {
  stockOnHand: string;
  orderQty: string;
  received: boolean;
  supplierId: string;
};

type HeaderDraft = {
  weekCommencing: string;
  orderedBy: string;
  pizzasExpected: string;
  supplierDay: string;
  notes: string;
};

/** Units that are ordered in whole numbers. */
const WHOLE_UNITS: StockUnit[] = [
  "EACH",
  "PACK",
  "BOX",
  "ROLL",
  "CARTON",
  "BAG",
];

const inputNumberClass = "h-9 w-20 px-2 text-right text-sm";

function nextMondayIso(): string {
  const date = new Date();
  const day = date.getDay();
  const delta = day === 1 ? 0 : (8 - day) % 7;
  date.setDate(date.getDate() + delta);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatDate(value: string | null): string {
  if (!value) {
    return "—";
  }
  const date = new Date(value.length === 10 ? `${value}T00:00:00` : value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString();
}

function trimNumber(value: string | null): string {
  if (value === null || value === "") {
    return "";
  }
  const num = Number(value);
  if (!Number.isFinite(num)) {
    return value;
  }
  return String(Math.round(num * 1000) / 1000);
}

function parseQty(value: string): number | null | "invalid" {
  const trimmed = value.trim();
  if (trimmed === "") {
    return null;
  }
  const num = Number(trimmed);
  if (!Number.isFinite(num) || num < 0) {
    return "invalid";
  }
  return Math.round(num * 1000) / 1000;
}

function lineToDraft(line: WeeklyOrderLine): LineDraft {
  return {
    stockOnHand: trimNumber(line.stockOnHand),
    orderQty: trimNumber(line.orderQty),
    received: line.received,
    supplierId: line.supplierId ?? "",
  };
}

function headerToDraft(order: WeeklyOrder): HeaderDraft {
  return {
    weekCommencing: order.weekCommencing,
    orderedBy: order.orderedBy ?? "",
    pizzasExpected:
      order.pizzasExpected === null ? "" : String(order.pizzasExpected),
    supplierDay: order.supplierDay ?? "",
    notes: order.notes ?? "",
  };
}

/** Guide scaled to the expected pizza count, rounded sensibly for the unit. */
function scaledGuide(
  line: WeeklyOrderLine,
  pizzas: number | null,
  base: number,
): number | null {
  if (line.guideQty === null) {
    return null;
  }
  const guide = Number(line.guideQty);
  if (!Number.isFinite(guide)) {
    return null;
  }
  const factor = pizzas !== null && base > 0 ? pizzas / base : 1;
  const raw = guide * factor;
  if (WHOLE_UNITS.includes(line.unit)) {
    return Math.ceil(raw - 1e-9);
  }
  return Math.round(raw * 10) / 10;
}

function statusBadgeClass(status: WeeklyOrderStatus): string {
  return status === "SENT"
    ? "bg-sky-500/15 text-sky-700 dark:text-sky-300"
    : "bg-zinc-500/15 text-zinc-600 dark:text-zinc-300";
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}): React.ReactElement {
  return (
    <div className={className}>
      <label className={cn("mb-1 block text-xs font-medium", secondaryText)}>
        {label}
      </label>
      {children}
    </div>
  );
}

export function WeeklyOrderPanel({
  token,
  brandSlug,
  onStockRefresh,
}: WeeklyOrderPanelProps): React.ReactElement {
  const [orders, setOrders] = useState<WeeklyOrderSummary[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  // Create form
  const [createOpen, setCreateOpen] = useState(false);
  const [newWeek, setNewWeek] = useState(nextMondayIso());
  const [newOrderedBy, setNewOrderedBy] = useState("");
  const [newPizzas, setNewPizzas] = useState("500");
  const [newSupplierDay, setNewSupplierDay] = useState("");
  const [copyLast, setCopyLast] = useState(true);

  // Editor
  const [order, setOrder] = useState<WeeklyOrder | null>(null);
  const [header, setHeader] = useState<HeaderDraft | null>(null);
  const [drafts, setDrafts] = useState<Record<string, LineDraft>>({});

  // Send dialog
  const [sendOpen, setSendOpen] = useState(false);
  const [preview, setPreview] = useState<WeeklyOrderVendorPreview | null>(null);
  const [selectedVendors, setSelectedVendors] = useState<Set<string>>(
    new Set(),
  );

  const loadList = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const [list, supplierList] = await Promise.all([
        fetchWeeklyOrders(token, brandSlug),
        fetchSuppliers(token, brandSlug),
      ]);
      setOrders(list);
      setSuppliers(supplierList.filter((s) => s.isActive));
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load weekly orders.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [token, brandSlug]);

  useEffect(() => {
    void loadList();
  }, [loadList]);

  const applyOrder = useCallback((next: WeeklyOrder): void => {
    setOrder(next);
    setHeader(headerToDraft(next));
    const nextDrafts: Record<string, LineDraft> = {};
    for (const line of next.lines) {
      nextDrafts[line.id] = lineToDraft(line);
    }
    setDrafts(nextDrafts);
  }, []);

  const closeEditor = (): void => {
    setOrder(null);
    setHeader(null);
    setDrafts({});
    void loadList();
  };

  const openOrder = async (id: string): Promise<void> => {
    setBusy(`open-${id}`);
    setError(null);
    setSuccess(null);
    try {
      applyOrder(await fetchWeeklyOrder(token, id, brandSlug));
    } catch (openError) {
      setError(
        openError instanceof Error ? openError.message : "Unable to open order.",
      );
    } finally {
      setBusy(null);
    }
  };

  const handleSeed = async (): Promise<void> => {
    setBusy("seed");
    setError(null);
    setSuccess(null);
    try {
      const result = await seedWeeklySheetCatalog(token, brandSlug);
      setSuccess(
        `Standard sheet loaded: ${result.created} new, ${result.updated} updated (${result.total} items).`,
      );
      onStockRefresh?.();
    } catch (seedError) {
      setError(
        seedError instanceof Error
          ? seedError.message
          : "Unable to load sheet items.",
      );
    } finally {
      setBusy(null);
    }
  };

  const handleCreate = async (): Promise<void> => {
    if (!newWeek) {
      setError("Pick the week commencing date.");
      return;
    }
    setBusy("create");
    setError(null);
    setSuccess(null);
    try {
      const pizzasRaw = newPizzas.trim();
      const created = await createWeeklyOrder(
        token,
        {
          weekCommencing: newWeek,
          orderedBy: newOrderedBy.trim() || null,
          pizzasExpected: pizzasRaw === "" ? null : Number(pizzasRaw),
          supplierDay: newSupplierDay.trim() || null,
          copyFromOrderId: copyLast && orders[0] ? orders[0].id : undefined,
        },
        brandSlug,
      );
      setCreateOpen(false);
      applyOrder(created);
    } catch (createError) {
      setError(
        createError instanceof Error
          ? createError.message
          : "Unable to create weekly order.",
      );
    } finally {
      setBusy(null);
    }
  };

  const handleDelete = async (id: string): Promise<void> => {
    if (!window.confirm("Delete this weekly order? This cannot be undone.")) {
      return;
    }
    setBusy(`delete-${id}`);
    setError(null);
    try {
      await deleteWeeklyOrder(token, id, brandSlug);
      if (order?.id === id) {
        closeEditor();
      } else {
        await loadList();
      }
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Unable to delete order.",
      );
    } finally {
      setBusy(null);
    }
  };

  // ── Editor helpers ────────────────────────────────────────────────

  const pizzas = useMemo(() => {
    if (!header || header.pizzasExpected.trim() === "") {
      return null;
    }
    const n = Number(header.pizzasExpected);
    return Number.isFinite(n) && n >= 0 ? n : null;
  }, [header]);

  const grouped = useMemo(() => {
    const map = new Map<string, WeeklyOrderLine[]>();
    for (const line of order?.lines ?? []) {
      const list = map.get(line.category) ?? [];
      list.push(line);
      map.set(line.category, list);
    }
    return [...map.entries()];
  }, [order]);

  const changedLines = useMemo(() => {
    if (!order) {
      return [];
    }
    return order.lines.filter((line) => {
      const draft = drafts[line.id];
      if (!draft) {
        return false;
      }
      const base = lineToDraft(line);
      return (
        base.stockOnHand !== draft.stockOnHand.trim() ||
        base.orderQty !== draft.orderQty.trim() ||
        base.received !== draft.received ||
        base.supplierId !== draft.supplierId
      );
    });
  }, [order, drafts]);

  const headerDirty = useMemo(() => {
    if (!order || !header) {
      return false;
    }
    const base = headerToDraft(order);
    return (
      base.weekCommencing !== header.weekCommencing ||
      base.orderedBy !== header.orderedBy.trim() ||
      base.pizzasExpected !== header.pizzasExpected.trim() ||
      base.supplierDay !== header.supplierDay.trim() ||
      base.notes !== header.notes.trim()
    );
  }, [order, header]);

  const isDirty = changedLines.length > 0 || headerDirty;

  const orderedCount = useMemo(
    () =>
      (order?.lines ?? []).filter((line) => {
        const qty = Number(drafts[line.id]?.orderQty ?? "");
        return Number.isFinite(qty) && qty > 0;
      }).length,
    [order, drafts],
  );

  const setDraft = (lineId: string, patch: Partial<LineDraft>): void => {
    setDrafts((current) => ({
      ...current,
      [lineId]: { ...current[lineId], ...patch },
    }));
  };

  const fillFromGuide = (): void => {
    if (!order) {
      return;
    }
    setDrafts((current) => {
      const next = { ...current };
      for (const line of order.lines) {
        const draft = next[line.id];
        if (!draft || draft.orderQty.trim() !== "") {
          continue;
        }
        const suggested = scaledGuide(line, pizzas, order.guideBasePizzas);
        if (suggested !== null && suggested > 0) {
          next[line.id] = { ...draft, orderQty: String(suggested) };
        }
      }
      return next;
    });
    setSuccess(
      "Empty order quantities were filled from the guide. Review and adjust, then Save.",
    );
    setError(null);
  };

  const buildPayload = (): UpdateWeeklyOrderPayload | string => {
    if (!order || !header) {
      return "Nothing to save.";
    }
    const payload: UpdateWeeklyOrderPayload = {};
    const base = headerToDraft(order);

    if (header.weekCommencing && base.weekCommencing !== header.weekCommencing) {
      payload.weekCommencing = header.weekCommencing;
    }
    if (base.orderedBy !== header.orderedBy.trim()) {
      payload.orderedBy = header.orderedBy.trim() || null;
    }
    if (base.supplierDay !== header.supplierDay.trim()) {
      payload.supplierDay = header.supplierDay.trim() || null;
    }
    if (base.notes !== header.notes.trim()) {
      payload.notes = header.notes.trim() || null;
    }
    if (base.pizzasExpected !== header.pizzasExpected.trim()) {
      const raw = header.pizzasExpected.trim();
      if (raw === "") {
        payload.pizzasExpected = null;
      } else {
        const n = Number(raw);
        if (!Number.isInteger(n) || n < 0) {
          return "Pizzas expected must be a whole number.";
        }
        payload.pizzasExpected = n;
      }
    }

    const lines: NonNullable<UpdateWeeklyOrderPayload["lines"]> = [];
    for (const line of changedLines) {
      const draft = drafts[line.id];
      const onHand = parseQty(draft.stockOnHand);
      const qty = parseQty(draft.orderQty);
      if (onHand === "invalid" || qty === "invalid") {
        return `Check the numbers for "${line.name}".`;
      }
      const base = lineToDraft(line);
      const entry: NonNullable<UpdateWeeklyOrderPayload["lines"]>[number] = {
        id: line.id,
      };
      if (base.stockOnHand !== draft.stockOnHand.trim()) {
        entry.stockOnHand = onHand;
      }
      if (base.orderQty !== draft.orderQty.trim()) {
        entry.orderQty = qty;
      }
      if (base.received !== draft.received) {
        entry.received = draft.received;
      }
      if (base.supplierId !== draft.supplierId) {
        entry.supplierId = draft.supplierId || null;
      }
      lines.push(entry);
    }
    if (lines.length > 0) {
      payload.lines = lines;
    }
    return payload;
  };

  /** Saves pending edits. Returns the fresh order, or null on failure. */
  const saveChanges = async (): Promise<WeeklyOrder | null> => {
    if (!order) {
      return null;
    }
    if (!isDirty) {
      return order;
    }
    const payload = buildPayload();
    if (typeof payload === "string") {
      setError(payload);
      return null;
    }
    setBusy("save");
    setError(null);
    try {
      const saved = await updateWeeklyOrder(token, order.id, payload, brandSlug);
      applyOrder(saved);
      return saved;
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to save weekly order.",
      );
      return null;
    } finally {
      setBusy(null);
    }
  };

  const handleSave = async (): Promise<void> => {
    setSuccess(null);
    const saved = await saveChanges();
    if (saved) {
      setSuccess("Saved.");
    }
  };

  const handlePdf = async (blank: boolean): Promise<void> => {
    if (!order) {
      return;
    }
    setSuccess(null);
    if (!blank) {
      const saved = await saveChanges();
      if (!saved) {
        return;
      }
    }
    setBusy(blank ? "pdf-blank" : "pdf");
    setError(null);
    try {
      await downloadWeeklyOrderPdf(
        token,
        order.id,
        {
          blank,
          filename: blank
            ? `weekly-stock-order-blank-${order.weekCommencing}.pdf`
            : `weekly-stock-order-${order.weekCommencing}.pdf`,
        },
        brandSlug,
      );
    } catch (pdfError) {
      setError(
        pdfError instanceof Error ? pdfError.message : "Unable to build PDF.",
      );
    } finally {
      setBusy(null);
    }
  };

  const openSend = async (): Promise<void> => {
    if (!order) {
      return;
    }
    setSuccess(null);
    const saved = await saveChanges();
    if (!saved) {
      return;
    }
    setBusy("preview");
    setError(null);
    try {
      const result = await previewWeeklyOrder(token, saved.id, brandSlug);
      setPreview(result);
      setSelectedVendors(
        new Set(result.vendors.filter((v) => v.email).map((v) => v.supplierId)),
      );
      setSendOpen(true);
    } catch (previewError) {
      setError(
        previewError instanceof Error
          ? previewError.message
          : "Unable to prepare send.",
      );
    } finally {
      setBusy(null);
    }
  };

  const handleSend = async (): Promise<void> => {
    if (!order) {
      return;
    }
    setBusy("send");
    setError(null);
    try {
      const result = await sendWeeklyOrder(
        token,
        order.id,
        [...selectedVendors],
        brandSlug,
      );
      applyOrder(result);
      setSendOpen(false);
      const ok = result.results.filter((r) => r.status === "SENT").length;
      const failed = result.results.length - ok;
      if (failed > 0) {
        setError(
          `${ok} email(s) sent, ${failed} failed — see the send history below.`,
        );
      } else {
        setSuccess(`Sent ${ok} vendor email${ok === 1 ? "" : "s"}.`);
      }
    } catch (sendError) {
      setError(
        sendError instanceof Error ? sendError.message : "Unable to send.",
      );
    } finally {
      setBusy(null);
    }
  };

  const downloadVendorPdf = async (
    supplierId: string,
    supplierName: string,
  ): Promise<void> => {
    if (!order) {
      return;
    }
    try {
      await downloadWeeklyOrderPdf(
        token,
        order.id,
        {
          supplierId,
          filename: `weekly-order-${supplierName
            .replace(/[^a-z0-9]+/gi, "-")
            .toLowerCase()}.pdf`,
        },
        brandSlug,
      );
    } catch (pdfError) {
      setError(
        pdfError instanceof Error ? pdfError.message : "Unable to build PDF.",
      );
    }
  };

  const feedback = (
    <>
      {error ? (
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-300">
          {success}
        </p>
      ) : null}
    </>
  );

  // ── Editor view ───────────────────────────────────────────────────

  if (order && header) {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className={cn("font-display text-xl font-bold", primaryText)}>
              Weekly stock order #{order.number}
            </h2>
            <p className={cn("text-sm", secondaryText)}>
              One sheet for the week. Each item has a default vendor — sending
              splits the sheet into one email per vendor.
            </p>
          </div>
          <Button onClick={closeEditor} type="button" variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to list
          </Button>
        </div>

        <div
          className={cn(
            "grid gap-3 rounded-2xl p-4 sm:grid-cols-2 lg:grid-cols-4",
            dashboardGlass,
          )}
        >
          <Field label="Week commencing">
            <Input
              onChange={(e) =>
                setHeader({ ...header, weekCommencing: e.target.value })
              }
              type="date"
              value={header.weekCommencing}
            />
          </Field>
          <Field label="Ordered by">
            <Input
              onChange={(e) =>
                setHeader({ ...header, orderedBy: e.target.value })
              }
              value={header.orderedBy}
            />
          </Field>
          <Field label="Pizzas expected">
            <Input
              inputMode="numeric"
              onChange={(e) =>
                setHeader({ ...header, pizzasExpected: e.target.value })
              }
              placeholder={String(order.guideBasePizzas)}
              value={header.pizzasExpected}
            />
          </Field>
          <Field label="Supplier day">
            <Input
              onChange={(e) =>
                setHeader({ ...header, supplierDay: e.target.value })
              }
              placeholder="e.g. Thursday"
              value={header.supplierDay}
            />
          </Field>
          <Field className="sm:col-span-2 lg:col-span-4" label="Notes">
            <Input
              onChange={(e) => setHeader({ ...header, notes: e.target.value })}
              placeholder="Optional — included on the vendor emails"
              value={header.notes}
            />
          </Field>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            disabled={busy !== null || !isDirty}
            onClick={() => void handleSave()}
            type="button"
          >
            {busy === "save" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save{isDirty ? " changes" : ""}
          </Button>
          <Button
            disabled={busy !== null}
            onClick={fillFromGuide}
            type="button"
            variant="outline"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Fill empty from guide
          </Button>
          <Button
            disabled={busy !== null}
            onClick={() => void handlePdf(true)}
            type="button"
            variant="outline"
          >
            {busy === "pdf-blank" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Printer className="mr-2 h-4 w-4" />
            )}
            Print blank sheet
          </Button>
          <Button
            disabled={busy !== null}
            onClick={() => void handlePdf(false)}
            type="button"
            variant="outline"
          >
            {busy === "pdf" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Download PDF
          </Button>
          <Button
            disabled={busy !== null || orderedCount === 0}
            onClick={() => void openSend()}
            type="button"
          >
            {busy === "preview" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            Send to vendors
          </Button>
          <span className={cn("ml-auto text-sm", secondaryText)}>
            {orderedCount} item{orderedCount === 1 ? "" : "s"} to order
            {pizzas !== null
              ? ` · guide scaled for ${pizzas} pizzas`
              : ` · guide at ${order.guideBasePizzas} pizzas`}
          </span>
        </div>

        {feedback}

        {grouped.map(([category, lines]) => (
          <section key={category}>
            <h3
              className={cn(
                "mb-2 font-display text-sm font-bold text-[#d81b60]",
              )}
            >
              {category}
            </h3>
            <div className="overflow-x-auto rounded-2xl border border-zinc-200/60 dark:border-white/10">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-zinc-200/60 bg-zinc-50/80 dark:border-white/10 dark:bg-zinc-900/50">
                  <tr
                    className={cn(
                      "text-xs uppercase tracking-wide",
                      secondaryText,
                    )}
                  >
                    <th className="px-3 py-2 font-semibold">Item</th>
                    <th className="px-3 py-2 font-semibold">Unit</th>
                    <th className="px-3 py-2 font-semibold">Pack size</th>
                    <th className="px-3 py-2 text-right font-semibold">
                      Guide
                    </th>
                    <th className="px-3 py-2 text-right font-semibold">
                      On hand
                    </th>
                    <th className="px-3 py-2 text-right font-semibold">
                      Order qty
                    </th>
                    <th className="px-3 py-2 font-semibold">Vendor</th>
                    <th className="px-3 py-2 text-center font-semibold">
                      Rec&apos;d
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map((line) => {
                    const draft = drafts[line.id] ?? lineToDraft(line);
                    const guide = scaledGuide(
                      line,
                      pizzas,
                      order.guideBasePizzas,
                    );
                    const needsVendor =
                      draft.supplierId === "" &&
                      Number(draft.orderQty) > 0;
                    return (
                      <tr
                        className="border-b border-zinc-200/40 last:border-0 dark:border-white/5"
                        key={line.id}
                      >
                        <td className={cn("px-3 py-2", primaryText)}>
                          {line.name}
                        </td>
                        <td className={cn("px-3 py-2", secondaryText)}>
                          {STOCK_UNIT_LABELS[line.unit]}
                        </td>
                        <td className={cn("px-3 py-2", secondaryText)}>
                          {line.packSize ?? "—"}
                        </td>
                        <td
                          className={cn(
                            "px-3 py-2 text-right tabular-nums",
                            secondaryText,
                          )}
                        >
                          {guide === null ? "—" : `~${guide}`}
                        </td>
                        <td className="px-3 py-2 text-right">
                          <Input
                            className={inputNumberClass}
                            inputMode="decimal"
                            onChange={(e) =>
                              setDraft(line.id, { stockOnHand: e.target.value })
                            }
                            value={draft.stockOnHand}
                          />
                        </td>
                        <td className="px-3 py-2 text-right">
                          <Input
                            className={inputNumberClass}
                            inputMode="decimal"
                            onChange={(e) =>
                              setDraft(line.id, { orderQty: e.target.value })
                            }
                            value={draft.orderQty}
                          />
                        </td>
                        <td className="px-3 py-2">
                          <select
                            className={cn(
                              inventorySelectClassName,
                              "h-9 min-w-[9rem]",
                              needsVendor && "border-amber-500",
                            )}
                            onChange={(e) =>
                              setDraft(line.id, { supplierId: e.target.value })
                            }
                            value={draft.supplierId}
                          >
                            <option value="">No vendor</option>
                            {suppliers.map((supplier) => (
                              <option key={supplier.id} value={supplier.id}>
                                {supplier.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-3 py-2 text-center">
                          <input
                            aria-label={`Received ${line.name}`}
                            checked={draft.received}
                            className="h-4 w-4 accent-[#d81b60]"
                            onChange={(e) =>
                              setDraft(line.id, { received: e.target.checked })
                            }
                            type="checkbox"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        ))}

        {order.dispatches.length > 0 ? (
          <section>
            <h3 className={cn("mb-2 font-display text-sm font-bold", primaryText)}>
              Send history
            </h3>
            <ul className="space-y-1 text-sm">
              {order.dispatches.map((d) => (
                <li
                  className={cn(
                    "flex flex-wrap items-center gap-x-3 rounded-lg px-3 py-2",
                    d.status === "SENT"
                      ? "bg-emerald-500/10"
                      : "bg-red-500/10",
                  )}
                  key={d.id}
                >
                  <span className={cn("font-medium", primaryText)}>
                    {d.supplierName}
                  </span>
                  <span className={secondaryText}>
                    {d.emailedTo} · {d.itemCount} item
                    {d.itemCount === 1 ? "" : "s"} ·{" "}
                    {new Date(d.sentAt).toLocaleString()}
                  </span>
                  <span
                    className={
                      d.status === "SENT" ? "text-emerald-700" : "text-red-600"
                    }
                  >
                    {d.status === "SENT" ? "Sent" : `Failed: ${d.error ?? ""}`}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <Dialog onOpenChange={setSendOpen} open={sendOpen}>
          <DialogContent className={cn("max-w-xl", adminDialogSurface)}>
            <h3 className={cn("font-display text-lg font-bold", primaryText)}>
              Send to vendors
            </h3>
            <p className={cn("mt-1 text-sm", secondaryText)}>
              One email per vendor, with a PDF of only their items, sent from
              this store&apos;s email settings.
            </p>

            {preview && preview.unassigned.length > 0 ? (
              <div className="mt-3 flex gap-2 rounded-lg bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-300">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  No vendor set for: {preview.unassigned.map((l) => l.name).join(", ")}
                  . Close this, pick a vendor on those lines, then try again.
                </span>
              </div>
            ) : null}

            <ul className="mt-3 max-h-80 space-y-2 overflow-y-auto">
              {preview?.vendors.map((vendor) => {
                const checked = selectedVendors.has(vendor.supplierId);
                return (
                  <li
                    className="rounded-xl border border-zinc-200/60 p-3 dark:border-white/10"
                    key={vendor.supplierId}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        aria-label={`Send to ${vendor.supplierName}`}
                        checked={checked}
                        className="mt-1 h-4 w-4 accent-[#d81b60]"
                        disabled={!vendor.email}
                        onChange={(e) => {
                          setSelectedVendors((current) => {
                            const next = new Set(current);
                            if (e.target.checked) {
                              next.add(vendor.supplierId);
                            } else {
                              next.delete(vendor.supplierId);
                            }
                            return next;
                          });
                        }}
                        type="checkbox"
                      />
                      <div className="min-w-0 flex-1">
                        <p className={cn("font-medium", primaryText)}>
                          {vendor.supplierName}{" "}
                          <span className={cn("font-normal", secondaryText)}>
                            · {vendor.lines.length} item
                            {vendor.lines.length === 1 ? "" : "s"}
                          </span>
                        </p>
                        {vendor.email ? (
                          <p className={cn("text-xs", secondaryText)}>
                            {vendor.email}
                          </p>
                        ) : (
                          <p className="text-xs text-amber-600">
                            No email on file — add one on the Suppliers tab.
                          </p>
                        )}
                        <p className={cn("mt-1 text-xs", secondaryText)}>
                          {vendor.lines
                            .map(
                              (l) =>
                                `${l.name} ×${trimNumber(l.orderQty)}`,
                            )
                            .join(", ")}
                        </p>
                      </div>
                      <Button
                        onClick={() =>
                          void downloadVendorPdf(
                            vendor.supplierId,
                            vendor.supplierName,
                          )
                        }
                        className="h-8 px-3"
                        type="button"
                        variant="outline"
                      >
                        <FileText className="mr-1 h-3.5 w-3.5" />
                        PDF
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="mt-4 flex justify-end gap-2">
              <Button
                onClick={() => setSendOpen(false)}
                type="button"
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                disabled={
                  busy === "send" ||
                  selectedVendors.size === 0 ||
                  (preview?.unassigned.length ?? 0) > 0
                }
                onClick={() => void handleSend()}
                type="button"
              >
                {busy === "send" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                Send {selectedVendors.size} email
                {selectedVendors.size === 1 ? "" : "s"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // ── List view ─────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className={cn("font-display text-xl font-bold", primaryText)}>
            Weekly stock order
          </h2>
          <p className={cn("text-sm", secondaryText)}>
            Fill the weekly sheet, then send it to each vendor by email. Past
            weeks stay exactly as they were ordered.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            disabled={busy !== null}
            onClick={() => void handleSeed()}
            type="button"
            variant="outline"
          >
            {busy === "seed" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <PackagePlus className="mr-2 h-4 w-4" />
            )}
            Load standard sheet items
          </Button>
          <Button
            onClick={() => {
              setCreateOpen((open) => !open);
              setError(null);
              setSuccess(null);
            }}
            type="button"
          >
            <Plus className="mr-2 h-4 w-4" />
            New weekly order
          </Button>
        </div>
      </div>

      {createOpen ? (
        <div
          className={cn(
            "grid gap-3 rounded-2xl p-4 sm:grid-cols-2 lg:grid-cols-4",
            dashboardGlass,
          )}
        >
          <Field label="Week commencing">
            <Input
              onChange={(e) => setNewWeek(e.target.value)}
              type="date"
              value={newWeek}
            />
          </Field>
          <Field label="Ordered by">
            <Input
              onChange={(e) => setNewOrderedBy(e.target.value)}
              value={newOrderedBy}
            />
          </Field>
          <Field label="Pizzas expected">
            <Input
              inputMode="numeric"
              onChange={(e) => setNewPizzas(e.target.value)}
              value={newPizzas}
            />
          </Field>
          <Field label="Supplier day">
            <Input
              onChange={(e) => setNewSupplierDay(e.target.value)}
              placeholder="e.g. Thursday"
              value={newSupplierDay}
            />
          </Field>
          {orders.length > 0 ? (
            <label
              className={cn(
                "flex items-center gap-2 text-sm sm:col-span-2",
                primaryText,
              )}
            >
              <input
                checked={copyLast}
                className="h-4 w-4 accent-[#d81b60]"
                onChange={(e) => setCopyLast(e.target.checked)}
                type="checkbox"
              />
              Start from last week&apos;s quantities
            </label>
          ) : null}
          <div className="flex items-end justify-end gap-2 sm:col-span-2 lg:col-span-2">
            <Button
              onClick={() => setCreateOpen(false)}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              disabled={busy === "create"}
              onClick={() => void handleCreate()}
              type="button"
            >
              {busy === "create" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Create sheet
            </Button>
          </div>
        </div>
      ) : null}

      {feedback}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-[#d81b60]" />
        </div>
      ) : orders.length === 0 ? (
        <p className={cn("rounded-2xl p-6 text-sm", dashboardGlass, secondaryText)}>
          No weekly orders yet. Use &quot;Load standard sheet items&quot; once
          to add the 65 sheet items to your stock list, then create your first
          weekly order.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-zinc-200/60 dark:border-white/10">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-zinc-200/60 bg-zinc-50/80 dark:border-white/10 dark:bg-zinc-900/50">
              <tr
                className={cn("text-xs uppercase tracking-wide", secondaryText)}
              >
                <th className="px-4 py-3 font-semibold">Week commencing</th>
                <th className="px-4 py-3 font-semibold">#</th>
                <th className="px-4 py-3 font-semibold">Ordered by</th>
                <th className="px-4 py-3 text-right font-semibold">Pizzas</th>
                <th className="px-4 py-3 text-right font-semibold">Items</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {orders.map((row) => (
                <tr
                  className="border-b border-zinc-200/40 last:border-0 dark:border-white/5"
                  key={row.id}
                >
                  <td className={cn("px-4 py-3 font-medium", primaryText)}>
                    {formatDate(row.weekCommencing)}
                  </td>
                  <td className={cn("px-4 py-3", secondaryText)}>
                    {row.number}
                  </td>
                  <td className={cn("px-4 py-3", secondaryText)}>
                    {row.orderedBy ?? "—"}
                  </td>
                  <td
                    className={cn(
                      "px-4 py-3 text-right tabular-nums",
                      secondaryText,
                    )}
                  >
                    {row.pizzasExpected ?? "—"}
                  </td>
                  <td
                    className={cn(
                      "px-4 py-3 text-right tabular-nums",
                      secondaryText,
                    )}
                  >
                    {row.orderedLineCount}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-xs font-medium",
                        statusBadgeClass(row.status),
                      )}
                    >
                      {row.status === "SENT" ? "Sent" : "Draft"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        disabled={busy !== null}
                        onClick={() => void openOrder(row.id)}
                        className="h-8 px-3"
                        type="button"
                        variant="outline"
                      >
                        {busy === `open-${row.id}` ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Open"
                        )}
                      </Button>
                      <Button
                        aria-label="Delete weekly order"
                        disabled={busy !== null}
                        onClick={() => void handleDelete(row.id)}
                        className="h-8 px-3"
                        type="button"
                        variant="outline"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
