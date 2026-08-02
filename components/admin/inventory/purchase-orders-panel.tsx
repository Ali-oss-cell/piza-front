"use client";

import * as Dialog from "@radix-ui/react-dialog";
import {
  ClipboardList,
  Download,
  Loader2,
  Plus,
  Send,
  Trash2,
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

interface DraftLine {
  key: string;
  stockItemId: string;
  qtyOrdered: string;
  unitCost: string;
}

function emptyLine(): DraftLine {
  return {
    key: `new-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    stockItemId: "",
    qtyOrdered: "",
    unitCost: "",
  };
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
  const [draftLines, setDraftLines] = useState<DraftLine[]>([emptyLine()]);
  const [isSaving, setIsSaving] = useState(false);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const activeStock = useMemo(
    () =>
      stockItems
        .filter((item) => item.isActive)
        .sort((a, b) => a.name.localeCompare(b.name)),
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
    setDraftLines([emptyLine()]);
    setError(null);
    setCreateOpen(true);
  };

  const handleCreate = async (): Promise<void> => {
    if (!supplierId) {
      setError("Select a supplier.");
      return;
    }
    const lines = draftLines
      .filter(
        (line) =>
          line.stockItemId &&
          Number(line.qtyOrdered) > 0 &&
          Number(line.unitCost) >= 0,
      )
      .map((line) => ({
        stockItemId: line.stockItemId,
        qtyOrdered: Number(line.qtyOrdered),
        unitCost: Number(line.unitCost),
      }));
    if (lines.length === 0) {
      setError("Add at least one stock line with quantity.");
      return;
    }

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

      {error && !createOpen ? (
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

      <Dialog.Root onOpenChange={setCreateOpen} open={createOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
          <Dialog.Content
            className={cn(
              "fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[min(96vw,36rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl p-6 shadow-2xl",
              dashboardGlass,
            )}
          >
            <Dialog.Title
              className={cn("font-display text-xl font-bold", primaryText)}
            >
              New purchase order
            </Dialog.Title>
            <div className="mt-5 space-y-4">
              <div>
                <label
                  className={cn("mb-1 block text-sm font-medium", primaryText)}
                >
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
                    Add an active supplier first.
                  </p>
                ) : null}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    className={cn("mb-1 block text-sm font-medium", primaryText)}
                  >
                    Expected date
                  </label>
                  <Input
                    onChange={(event) => setExpectedAt(event.target.value)}
                    type="date"
                    value={expectedAt}
                  />
                </div>
                <div>
                  <label
                    className={cn("mb-1 block text-sm font-medium", primaryText)}
                  >
                    Notes
                  </label>
                  <Input
                    onChange={(event) => setNotes(event.target.value)}
                    value={notes}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <p className={cn("text-sm font-medium", primaryText)}>Lines</p>
                {draftLines.map((line, index) => {
                  const stock = activeStock.find(
                    (item) => item.id === line.stockItemId,
                  );
                  return (
                    <div
                      className="flex flex-wrap items-end gap-2"
                      key={line.key}
                    >
                      <div className="min-w-[10rem] flex-1">
                        <label
                          className={cn("mb-1 block text-xs", secondaryText)}
                        >
                          Stock item
                        </label>
                        <select
                          className={inventorySelectClassName}
                          onChange={(event) =>
                            setDraftLines((current) =>
                              current.map((entry, i) =>
                                i === index
                                  ? {
                                      ...entry,
                                      stockItemId: event.target.value,
                                      unitCost:
                                        entry.unitCost ||
                                        activeStock.find(
                                          (item) =>
                                            item.id === event.target.value,
                                        )?.costPerUnit ||
                                        "",
                                    }
                                  : entry,
                              ),
                            )
                          }
                          value={line.stockItemId}
                        >
                          <option value="">Select…</option>
                          {activeStock.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.name} ({STOCK_UNIT_LABELS[item.unit]})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="w-24">
                        <label
                          className={cn("mb-1 block text-xs", secondaryText)}
                        >
                          Qty
                          {stock
                            ? ` (${STOCK_UNIT_LABELS[stock.unit]})`
                            : ""}
                        </label>
                        <Input
                          inputMode="decimal"
                          onChange={(event) =>
                            setDraftLines((current) =>
                              current.map((entry, i) =>
                                i === index
                                  ? {
                                      ...entry,
                                      qtyOrdered: event.target.value,
                                    }
                                  : entry,
                              ),
                            )
                          }
                          value={line.qtyOrdered}
                        />
                      </div>
                      <div className="w-28">
                        <label
                          className={cn("mb-1 block text-xs", secondaryText)}
                        >
                          Unit cost
                        </label>
                        <Input
                          inputMode="decimal"
                          onChange={(event) =>
                            setDraftLines((current) =>
                              current.map((entry, i) =>
                                i === index
                                  ? { ...entry, unitCost: event.target.value }
                                  : entry,
                              ),
                            )
                          }
                          value={line.unitCost}
                        />
                      </div>
                      <Button
                        onClick={() =>
                          setDraftLines((current) =>
                            current.length <= 1
                              ? [emptyLine()]
                              : current.filter((_, i) => i !== index),
                          )
                        }
                        size="icon"
                        type="button"
                        variant="ghost"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  );
                })}
                <Button
                  onClick={() =>
                    setDraftLines((current) => [...current, emptyLine()])
                  }
                  type="button"
                  variant="outline"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add line
                </Button>
              </div>

              {error ? (
                <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600">
                  {error}
                </p>
              ) : null}

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  onClick={() => setCreateOpen(false)}
                  type="button"
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button
                  disabled={isSaving || activeSuppliers.length === 0}
                  onClick={() => void handleCreate()}
                  type="button"
                >
                  {isSaving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Create draft
                </Button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
