"use client";

import {
  ClipboardList,
  Download,
  Loader2,
  Plus,
  Send,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  formatStockQty,
  inventorySelectClassName,
} from "@/components/admin/inventory/inventory-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  cancelPurchaseOrder,
  createPurchaseOrder,
  downloadPurchaseOrderPdf,
  fetchPurchaseOrders,
  fetchSuppliers,
  receivePurchaseOrder,
  sendPurchaseOrder,
} from "@/lib/admin-api";
import { dashboardGlass, primaryText, secondaryText } from "@/lib/theme-classes";
import { cn } from "@/lib/utils";
import type {
  PurchaseOrder,
  StockItem,
  StockUnit,
  Supplier,
} from "@/types/inventory";
import {
  PURCHASE_ORDER_STATUS_LABELS,
  STOCK_UNIT_LABELS,
} from "@/types/inventory";

interface PurchaseOrdersPanelProps {
  token: string;
  brandSlug: string;
  stockItems: StockItem[];
  onStockRefresh?: () => void;
}

type LineDraft = {
  qtyOrdered: string;
  unitCost: string;
};

function emptyLineDrafts(items: StockItem[]): Record<string, LineDraft> {
  const next: Record<string, LineDraft> = {};
  for (const item of items) {
    next[item.id] = {
      qtyOrdered: "",
      unitCost: item.costPerUnit ?? "",
    };
  }
  return next;
}

function statusBadgeClass(status: PurchaseOrder["status"]): string {
  switch (status) {
    case "DRAFT":
      return "bg-zinc-500/15 text-zinc-600 dark:text-zinc-300";
    case "SENT":
      return "bg-sky-500/15 text-sky-700 dark:text-sky-300";
    case "PARTIAL":
      return "bg-amber-500/15 text-amber-700 dark:text-amber-300";
    case "RECEIVED":
      return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300";
    case "CANCELLED":
      return "bg-red-500/15 text-red-600 dark:text-red-300";
    default:
      return "bg-zinc-500/15 text-zinc-500";
  }
}

function formatMoney(value: string): string {
  const num = Number(value);
  if (!Number.isFinite(num)) {
    return value;
  }
  return `$${num.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(value: string | null): string {
  if (!value) {
    return "—";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString();
}

export function PurchaseOrdersPanel({
  token,
  brandSlug,
  stockItems,
  onStockRefresh,
}: PurchaseOrdersPanelProps): React.ReactElement {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [supplierId, setSupplierId] = useState("");
  const [expectedAt, setExpectedAt] = useState("");
  const [notes, setNotes] = useState("");
  const [lineSearch, setLineSearch] = useState("");
  const [lineDrafts, setLineDrafts] = useState<Record<string, LineDraft>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const activeStock = useMemo(
    () =>
      [...stockItems]
        .filter((item) => item.isActive)
        .sort((a, b) => {
          const cat = (a.category ?? "").localeCompare(b.category ?? "");
          if (cat !== 0) {
            return cat;
          }
          return a.name.localeCompare(b.name);
        }),
    [stockItems],
  );

  const activeSuppliers = useMemo(
    () =>
      suppliers
        .filter((supplier) => supplier.isActive)
        .sort((a, b) => a.name.localeCompare(b.name)),
    [suppliers],
  );

  const selected = orders.find((order) => order.id === selectedId) ?? null;

  const load = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const [nextOrders, nextSuppliers] = await Promise.all([
        fetchPurchaseOrders(token, brandSlug),
        fetchSuppliers(token, brandSlug, { includeInactive: true }),
      ]);
      setOrders(nextOrders);
      setSuppliers(nextSuppliers);
      setSelectedId((current) => {
        if (current && nextOrders.some((order) => order.id === current)) {
          return current;
        }
        return nextOrders[0]?.id ?? null;
      });
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load purchase orders.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [token, brandSlug]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    setLineDrafts((current) => {
      const next = { ...current };
      for (const item of activeStock) {
        if (!next[item.id]) {
          next[item.id] = {
            qtyOrdered: "",
            unitCost: item.costPerUnit ?? "",
          };
        }
      }
      return next;
    });
  }, [activeStock]);

  const filteredStock = useMemo(() => {
    const query = lineSearch.trim().toLowerCase();
    if (!query) {
      return activeStock;
    }
    return activeStock.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        (item.category?.toLowerCase().includes(query) ?? false) ||
        (item.sku?.toLowerCase().includes(query) ?? false),
    );
  }, [activeStock, lineSearch]);

  const pendingLines = useMemo(() => {
    return activeStock
      .map((item) => {
        const draft = lineDrafts[item.id];
        const qty = Number(draft?.qtyOrdered ?? "");
        if (!draft || !Number.isFinite(qty) || qty <= 0) {
          return null;
        }
        return {
          item,
          qtyOrdered: qty,
          unitCost: draft.unitCost,
        };
      })
      .filter(Boolean) as Array<{
      item: StockItem;
      qtyOrdered: number;
      unitCost: string;
    }>;
  }, [activeStock, lineDrafts]);

  const draftTotal = useMemo(() => {
    return pendingLines.reduce((sum, row) => {
      const cost = Number(row.unitCost);
      if (!Number.isFinite(cost) || cost < 0) {
        return sum;
      }
      return sum + row.qtyOrdered * cost;
    }, 0);
  }, [pendingLines]);

  const updateLineDraft = (
    id: string,
    patch: Partial<LineDraft>,
  ): void => {
    setLineDrafts((current) => ({
      ...current,
      [id]: {
        qtyOrdered: current[id]?.qtyOrdered ?? "",
        unitCost: current[id]?.unitCost ?? "",
        ...patch,
      },
    }));
  };

  const upsertOrder = (updated: PurchaseOrder): void => {
    setOrders((current) => {
      const exists = current.some((order) => order.id === updated.id);
      if (!exists) {
        return [updated, ...current];
      }
      return current.map((order) =>
        order.id === updated.id ? updated : order,
      );
    });
    setSelectedId(updated.id);
  };

  const openCreate = (): void => {
    setSupplierId(activeSuppliers[0]?.id ?? "");
    setExpectedAt("");
    setNotes("");
    setLineSearch("");
    setLineDrafts(emptyLineDrafts(activeStock));
    setError(null);
    setSuccess(null);
    setCreateOpen(true);
  };

  const cancelCreate = (): void => {
    setCreateOpen(false);
    setError(null);
  };

  const handleCreate = async (): Promise<void> => {
    if (!supplierId) {
      setError("Select a supplier.");
      return;
    }
    if (pendingLines.length === 0) {
      setError("Enter a quantity on at least one stock item.");
      return;
    }
    for (const row of pendingLines) {
      if (
        row.unitCost.trim() === "" ||
        Number.isNaN(Number(row.unitCost)) ||
        Number(row.unitCost) < 0
      ) {
        setError(`Enter unit cost (AUD) for "${row.item.name}".`);
        return;
      }
    }

    const lines = pendingLines.map((row) => ({
      stockItemId: row.item.id,
      qtyOrdered: row.qtyOrdered,
      unitCost: Number(row.unitCost),
    }));

    setIsSaving(true);
    setError(null);
    try {
      const created = await createPurchaseOrder(
        token,
        {
          supplierId,
          expectedAt: expectedAt || null,
          notes: notes.trim() || null,
          lines,
        },
        brandSlug,
      );
      upsertOrder(created);
      setCreateOpen(false);
      setSuccess(`Draft PO #${created.number} created.`);
    } catch (createError) {
      setError(
        createError instanceof Error
          ? createError.message
          : "Unable to create purchase order.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const runAction = async (
    actionKey: string,
    action: () => Promise<PurchaseOrder>,
    successMessage: string,
  ): Promise<void> => {
    setBusyAction(actionKey);
    setError(null);
    setSuccess(null);
    try {
      const updated = await action();
      upsertOrder(updated);
      setSuccess(successMessage);
      if (actionKey.startsWith("receive")) {
        onStockRefresh?.();
      }
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : "Unable to complete action.",
      );
    } finally {
      setBusyAction(null);
    }
  };

  const handleDownloadPdf = async (order: PurchaseOrder): Promise<void> => {
    setBusyAction(`pdf-${order.id}`);
    setError(null);
    try {
      await downloadPurchaseOrderPdf(
        token,
        order.id,
        brandSlug,
        `PO-${order.number}.pdf`,
      );
    } catch (pdfError) {
      setError(
        pdfError instanceof Error
          ? pdfError.message
          : "Unable to download PDF.",
      );
    } finally {
      setBusyAction(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className={cn("h-8 w-8 animate-spin", secondaryText)} />
      </div>
    );
  }

  if (createOpen) {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className={cn("font-display text-2xl font-bold", primaryText)}>
              New purchase order
            </h2>
            <p className={cn("mt-1 max-w-2xl text-sm", secondaryText)}>
              Enter qty and unit cost on the items you want to order. Leave
              blank to skip.
            </p>
          </div>
          <Button onClick={cancelCreate} type="button" variant="outline">
            Back to list
          </Button>
        </div>

        <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-zinc-200/60 bg-white/50 p-4 dark:border-white/10 dark:bg-zinc-900/30">
          <div className="min-w-[12rem] flex-1">
            <label className={cn("mb-1 block text-xs font-medium", secondaryText)}>
              Supplier
            </label>
            <select
              className={inventorySelectClassName}
              onChange={(event) => setSupplierId(event.target.value)}
              value={supplierId}
            >
              <option value="">Select supplier…</option>
              {activeSuppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </select>
            {activeSuppliers.length === 0 ? (
              <p className={cn("mt-1 text-xs", secondaryText)}>
                Add an active supplier on the Suppliers tab first.
              </p>
            ) : null}
          </div>
          <div>
            <label className={cn("mb-1 block text-xs font-medium", secondaryText)}>
              Expected date
            </label>
            <Input
              className="w-44"
              onChange={(event) => setExpectedAt(event.target.value)}
              type="date"
              value={expectedAt}
            />
          </div>
          <div className="min-w-[12rem] flex-1">
            <label className={cn("mb-1 block text-xs font-medium", secondaryText)}>
              Notes
            </label>
            <Input
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Optional"
              value={notes}
            />
          </div>
          <div className="min-w-[12rem] flex-1">
            <label className={cn("mb-1 block text-xs font-medium", secondaryText)}>
              Search stock
            </label>
            <Input
              onChange={(event) => setLineSearch(event.target.value)}
              placeholder="Name, category, SKU…"
              value={lineSearch}
            />
          </div>
          <Button
            disabled={
              isSaving ||
              activeSuppliers.length === 0 ||
              pendingLines.length === 0
            }
            onClick={() => void handleCreate()}
            type="button"
          >
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Create draft
            {pendingLines.length > 0 ? ` (${pendingLines.length})` : ""}
          </Button>
        </div>

        {error ? (
          <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        ) : null}

        <p className={cn("text-sm", secondaryText)}>
          {pendingLines.length > 0
            ? `${pendingLines.length} line${pendingLines.length === 1 ? "" : "s"} · ${formatMoney(String(draftTotal))}`
            : "No lines selected yet"}
        </p>

        <div className="overflow-x-auto rounded-2xl border border-zinc-200/60 dark:border-white/10">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-zinc-200/60 bg-zinc-50/80 dark:border-white/10 dark:bg-zinc-900/50">
              <tr className={cn("text-xs uppercase tracking-wide", secondaryText)}>
                <th className="px-4 py-3 font-semibold">Stock item</th>
                <th className="px-4 py-3 font-semibold">Unit</th>
                <th className="px-4 py-3 font-semibold">On hand</th>
                <th className="px-4 py-3 font-semibold">Order qty</th>
                <th className="px-4 py-3 font-semibold">Unit cost</th>
                <th className="px-4 py-3 font-semibold">Line total</th>
              </tr>
            </thead>
            <tbody>
              {filteredStock.length === 0 ? (
                <tr>
                  <td
                    className={cn("px-4 py-10 text-center", secondaryText)}
                    colSpan={6}
                  >
                    No stock items yet. Add them on the Stock list tab first.
                  </td>
                </tr>
              ) : (
                filteredStock.map((item) => {
                  const draft = lineDrafts[item.id] ?? {
                    qtyOrdered: "",
                    unitCost: item.costPerUnit ?? "",
                  };
                  const qty = Number(draft.qtyOrdered);
                  const cost = Number(draft.unitCost);
                  const hasQty = Number.isFinite(qty) && qty > 0;
                  const lineTotal =
                    hasQty && Number.isFinite(cost) && cost >= 0
                      ? qty * cost
                      : null;

                  return (
                    <tr
                      className="border-b border-zinc-100 dark:border-white/5"
                      key={item.id}
                    >
                      <td className={cn("px-4 py-3 font-medium", primaryText)}>
                        {item.name}
                        {item.category ? (
                          <span
                            className={cn(
                              "mt-0.5 block text-xs font-normal",
                              secondaryText,
                            )}
                          >
                            {item.category}
                          </span>
                        ) : null}
                      </td>
                      <td className={cn("px-4 py-3", secondaryText)}>
                        {STOCK_UNIT_LABELS[item.unit]}
                      </td>
                      <td className={cn("px-4 py-3 tabular-nums", primaryText)}>
                        {formatStockQty(item.qtyOnHand, item.unit)}
                      </td>
                      <td className="px-4 py-3">
                        <Input
                          className="h-10 w-28"
                          inputMode="decimal"
                          onChange={(event) =>
                            updateLineDraft(item.id, {
                              qtyOrdered: event.target.value,
                            })
                          }
                          placeholder="0"
                          value={draft.qtyOrdered}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Input
                          className="h-10 w-28"
                          inputMode="decimal"
                          onChange={(event) =>
                            updateLineDraft(item.id, {
                              unitCost: event.target.value,
                            })
                          }
                          placeholder="0.00"
                          value={draft.unitCost}
                        />
                      </td>
                      <td className={cn("px-4 py-3 tabular-nums", secondaryText)}>
                        {lineTotal === null
                          ? "—"
                          : formatMoney(String(lineTotal))}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className={cn("font-display text-2xl font-bold", primaryText)}>
            Purchase orders
          </h2>
          <p className={cn("mt-1 text-sm", secondaryText)}>
            Order stock from suppliers, send, download PDF, then receive into
            inventory.
          </p>
        </div>
        <Button onClick={openCreate} type="button">
          <Plus className="mr-2 h-4 w-4" />
          New PO
        </Button>
      </div>

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

      <div className="grid gap-6 lg:grid-cols-[minmax(0,18rem)_1fr]">
        <div className="space-y-2">
          {orders.length === 0 ? (
            <div
              className={cn(
                "flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-300 px-4 py-10 text-center dark:border-white/15",
                dashboardGlass,
              )}
            >
              <ClipboardList className={cn("h-7 w-7", secondaryText)} />
              <p className={cn("text-sm", secondaryText)}>
                No purchase orders yet.
              </p>
            </div>
          ) : (
            orders.map((order) => (
              <button
                className={cn(
                  "w-full rounded-xl border px-3 py-3 text-left transition",
                  selectedId === order.id
                    ? "border-[#d81b60]/40 bg-[#d81b60]/8"
                    : "border-zinc-200/60 bg-white/50 hover:border-zinc-300 dark:border-white/10 dark:bg-zinc-900/30",
                )}
                key={order.id}
                onClick={() => {
                  setSelectedId(order.id);
                  setSuccess(null);
                  setError(null);
                }}
                type="button"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className={cn("font-medium", primaryText)}>
                    PO #{order.number}
                  </p>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                      statusBadgeClass(order.status),
                    )}
                  >
                    {PURCHASE_ORDER_STATUS_LABELS[order.status]}
                  </span>
                </div>
                <p className={cn("mt-1 text-xs", secondaryText)}>
                  {order.supplierName} · {formatMoney(order.total)}
                </p>
              </button>
            ))
          )}
        </div>

        <div>
          {selected ? (
            <div className="space-y-4 rounded-2xl border border-zinc-200/60 bg-white/50 p-5 dark:border-white/10 dark:bg-zinc-900/30">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3
                    className={cn(
                      "font-display text-xl font-bold",
                      primaryText,
                    )}
                  >
                    PO #{selected.number}
                  </h3>
                  <p className={cn("mt-1 text-sm", secondaryText)}>
                    {selected.supplierName}
                  </p>
                  <p className={cn("mt-1 text-xs", secondaryText)}>
                    Ordered {formatDate(selected.orderedAt)}
                    {selected.expectedAt
                      ? ` · Expected ${formatDate(selected.expectedAt)}`
                      : ""}
                    {selected.receivedAt
                      ? ` · Received ${formatDate(selected.receivedAt)}`
                      : ""}
                  </p>
                  {selected.notes ? (
                    <p className={cn("mt-2 text-sm", secondaryText)}>
                      {selected.notes}
                    </p>
                  ) : null}
                </div>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-1 text-xs font-semibold",
                    statusBadgeClass(selected.status),
                  )}
                >
                  {PURCHASE_ORDER_STATUS_LABELS[selected.status]}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[28rem] text-left text-sm">
                  <thead>
                    <tr className={cn("border-b border-zinc-200/60 text-xs dark:border-white/10", secondaryText)}>
                      <th className="pb-2 pr-3 font-medium">Item</th>
                      <th className="pb-2 pr-3 font-medium">Ordered</th>
                      <th className="pb-2 pr-3 font-medium">Received</th>
                      <th className="pb-2 pr-3 font-medium">Unit cost</th>
                      <th className="pb-2 font-medium">Line</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selected.lines.map((line) => (
                      <tr
                        className="border-b border-zinc-100 dark:border-white/5"
                        key={line.id}
                      >
                        <td className={cn("py-2 pr-3", primaryText)}>
                          {line.stockItemName}
                        </td>
                        <td className={cn("py-2 pr-3", secondaryText)}>
                          {formatStockQty(
                            line.qtyOrdered,
                            line.stockItemUnit as StockUnit,
                          )}
                        </td>
                        <td className={cn("py-2 pr-3", secondaryText)}>
                          {formatStockQty(
                            line.qtyReceived,
                            line.stockItemUnit as StockUnit,
                          )}
                        </td>
                        <td className={cn("py-2 pr-3", secondaryText)}>
                          {formatMoney(line.unitCost)}
                        </td>
                        <td className={cn("py-2", primaryText)}>
                          {formatMoney(line.lineTotal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className={cn("text-right text-sm font-semibold", primaryText)}>
                Total {formatMoney(selected.total)}
              </p>

              <div className="flex flex-wrap gap-2">
                {selected.status === "DRAFT" ? (
                  <Button
                    disabled={busyAction === `send-${selected.id}`}
                    onClick={() =>
                      void runAction(
                        `send-${selected.id}`,
                        () =>
                          sendPurchaseOrder(token, selected.id, brandSlug),
                        `PO #${selected.number} marked as sent.`,
                      )
                    }
                    type="button"
                  >
                    {busyAction === `send-${selected.id}` ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="mr-2 h-4 w-4" />
                    )}
                    Send
                  </Button>
                ) : null}

                <Button
                  disabled={busyAction === `pdf-${selected.id}`}
                  onClick={() => void handleDownloadPdf(selected)}
                  type="button"
                  variant="outline"
                >
                  {busyAction === `pdf-${selected.id}` ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="mr-2 h-4 w-4" />
                  )}
                  Download PDF
                </Button>

                {selected.status === "SENT" ||
                selected.status === "PARTIAL" ? (
                  <Button
                    disabled={busyAction === `receive-${selected.id}`}
                    onClick={() => {
                      if (
                        !window.confirm(
                          `Receive all remaining quantities on PO #${selected.number}?`,
                        )
                      ) {
                        return;
                      }
                      void runAction(
                        `receive-${selected.id}`,
                        () =>
                          receivePurchaseOrder(
                            token,
                            selected.id,
                            {},
                            brandSlug,
                          ),
                        `Received remaining stock for PO #${selected.number}.`,
                      );
                    }}
                    type="button"
                  >
                    {busyAction === `receive-${selected.id}` ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Receive remaining
                  </Button>
                ) : null}

                {selected.status === "DRAFT" ||
                selected.status === "SENT" ||
                selected.status === "PARTIAL" ? (
                  <Button
                    disabled={busyAction === `cancel-${selected.id}`}
                    onClick={() => {
                      if (
                        !window.confirm(
                          `Cancel PO #${selected.number}? This cannot be undone.`,
                        )
                      ) {
                        return;
                      }
                      void runAction(
                        `cancel-${selected.id}`,
                        () =>
                          cancelPurchaseOrder(token, selected.id, brandSlug),
                        `PO #${selected.number} cancelled.`,
                      );
                    }}
                    type="button"
                    variant="outline"
                  >
                    {busyAction === `cancel-${selected.id}` ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <XCircle className="mr-2 h-4 w-4 text-red-500" />
                    )}
                    Cancel
                  </Button>
                ) : null}
              </div>
            </div>
          ) : (
            <div
              className={cn(
                "flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-300 px-6 py-16 text-center dark:border-white/15",
                dashboardGlass,
              )}
            >
              <ClipboardList className={cn("h-8 w-8", secondaryText)} />
              <p className={cn("text-sm", secondaryText)}>
                Select a purchase order or create a new one.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
