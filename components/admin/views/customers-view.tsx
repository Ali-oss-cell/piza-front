"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Download, Loader2, Plus, Search, Tag, Users, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  backfillCrm,
  createCrmSegment,
  createCrmTag,
  crmExportUrl,
  deleteCrmSegment,
  deleteCrmTag,
  fetchCrmCustomer,
  fetchCrmCustomers,
  fetchCrmSegments,
  fetchCrmTags,
  updateCrmCustomer,
} from "@/lib/admin-api";
import { dashboardGlass, primaryText, secondaryText } from "@/lib/theme-classes";
import type { Brand } from "@/types/brand";
import type {
  CrmCustomer,
  CrmSegment,
  CrmSegmentRules,
  CrmTag,
} from "@/types/hq";
import { cn } from "@/lib/utils";

interface CustomersViewProps {
  token: string;
  brands: Brand[];
}

function formatMoney(value: string | number): string {
  return `$${Number(value || 0).toFixed(2)}`;
}

function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-AU");
}

export function CustomersView({ token, brands }: CustomersViewProps): React.ReactElement {
  const [brandSlug, setBrandSlug] = useState(brands[0]?.slug ?? "");
  const [query, setQuery] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [segmentFilter, setSegmentFilter] = useState("");
  const [customers, setCustomers] = useState<CrmCustomer[]>([]);
  const [total, setTotal] = useState(0);
  const [tags, setTags] = useState<CrmTag[]>([]);
  const [segments, setSegments] = useState<CrmSegment[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [profile, setProfile] = useState<CrmCustomer | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [tagsOpen, setTagsOpen] = useState(false);
  const [segmentsOpen, setSegmentsOpen] = useState(false);
  const [newTagLabel, setNewTagLabel] = useState("");
  const [segmentForm, setSegmentForm] = useState<{
    name: string;
    description: string;
    rules: CrmSegmentRules;
  }>({
    name: "",
    description: "",
    rules: {},
  });

  const loadMeta = useCallback(async (): Promise<void> => {
    if (!brandSlug) return;
    const [nextTags, nextSegments] = await Promise.all([
      fetchCrmTags(token, brandSlug),
      fetchCrmSegments(token, brandSlug),
    ]);
    setTags(nextTags);
    setSegments(nextSegments);
  }, [token, brandSlug]);

  const loadCustomers = useCallback(async (): Promise<void> => {
    if (!brandSlug) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchCrmCustomers(token, {
        brand: brandSlug,
        q: query.trim() || undefined,
        tag: tagFilter || undefined,
        segment: segmentFilter || undefined,
        take: 200,
      });
      setCustomers(data.customers);
      setTotal(data.total);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load customers.");
    } finally {
      setIsLoading(false);
    }
  }, [token, brandSlug, query, tagFilter, segmentFilter]);

  useEffect(() => {
    void loadMeta();
  }, [loadMeta]);

  useEffect(() => {
    void loadCustomers();
  }, [loadCustomers]);

  const openProfile = async (id: string): Promise<void> => {
    setSelectedId(id);
    setIsLoadingProfile(true);
    setError(null);
    try {
      const data = await fetchCrmCustomer(token, id);
      setProfile(data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load profile.");
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const saveProfile = async (): Promise<void> => {
    if (!profile) return;
    setIsSaving(true);
    setError(null);
    try {
      const updated = await updateCrmCustomer(token, profile.id, {
        name: profile.name ?? undefined,
        notes: profile.notes,
        marketingEmailOptIn: profile.marketingEmailOptIn,
        marketingSmsOptIn: profile.marketingSmsOptIn,
        tagIds: profile.tags.map((tag) => tag.id),
      });
      setProfile({ ...profile, ...updated, orders: profile.orders });
      setSuccess("Customer saved.");
      await loadCustomers();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save customer.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = async (): Promise<void> => {
    if (!brandSlug) return;
    try {
      const url = crmExportUrl({
        brand: brandSlug,
        q: query.trim() || undefined,
        tag: tagFilter || undefined,
        segment: segmentFilter || undefined,
      });
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Export failed");
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `crm-${brandSlug}.csv`;
      link.click();
      window.URL.revokeObjectURL(downloadUrl);
      setSuccess("CSV exported.");
    } catch (exportError) {
      setError(exportError instanceof Error ? exportError.message : "Export failed.");
    }
  };

  const handleBackfill = async (): Promise<void> => {
    if (!brandSlug) return;
    setIsSaving(true);
    setError(null);
    try {
      await backfillCrm(token, brandSlug);
      setSuccess("Backfill complete for this store.");
      await loadCustomers();
      await loadMeta();
    } catch (backfillError) {
      setError(backfillError instanceof Error ? backfillError.message : "Backfill failed.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateTag = async (): Promise<void> => {
    if (!newTagLabel.trim() || !brandSlug) return;
    setIsSaving(true);
    try {
      await createCrmTag(token, brandSlug, { label: newTagLabel.trim() });
      setNewTagLabel("");
      await loadMeta();
      setSuccess("Tag created.");
    } catch (tagError) {
      setError(tagError instanceof Error ? tagError.message : "Unable to create tag.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateSegment = async (): Promise<void> => {
    if (!segmentForm.name.trim() || !brandSlug) return;
    setIsSaving(true);
    try {
      await createCrmSegment(token, brandSlug, {
        name: segmentForm.name.trim(),
        description: segmentForm.description.trim() || undefined,
        rules: segmentForm.rules,
      });
      setSegmentForm({ name: "", description: "", rules: {} });
      await loadMeta();
      setSuccess("Segment created.");
    } catch (segmentError) {
      setError(segmentError instanceof Error ? segmentError.message : "Unable to create segment.");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleProfileTag = (tag: CrmTag): void => {
    if (!profile) return;
    const has = profile.tags.some((row) => row.id === tag.id);
    setProfile({
      ...profile,
      tags: has
        ? profile.tags.filter((row) => row.id !== tag.id)
        : [...profile.tags, tag],
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className={cn("font-display text-2xl font-bold", primaryText)}>Customers</h2>
          <p className={cn("mt-1 text-sm", secondaryText)}>
            Per-store CRM — tags, segments, consent, and CSV export
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setTagsOpen(true)} type="button" variant="outline">
            <Tag className="mr-2 h-4 w-4" />
            Tags
          </Button>
          <Button onClick={() => setSegmentsOpen(true)} type="button" variant="outline">
            <Users className="mr-2 h-4 w-4" />
            Segments
          </Button>
          <Button onClick={() => void handleExport()} type="button" variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button disabled={isSaving} onClick={() => void handleBackfill()} type="button" variant="ghost">
            Backfill from orders
          </Button>
        </div>
      </div>

      <div className={cn("space-y-4 rounded-2xl border p-5", dashboardGlass)}>
        <div className="grid gap-3 md:grid-cols-4">
          <div>
            <label className={cn("mb-1 block text-sm font-medium", primaryText)}>Store</label>
            <select
              className="flex h-11 w-full rounded-xl border border-zinc-200/70 bg-white px-4 text-sm dark:border-white/10 dark:bg-zinc-900"
              onChange={(event) => {
                setBrandSlug(event.target.value);
                setSelectedId(null);
                setProfile(null);
                setTagFilter("");
                setSegmentFilter("");
              }}
              value={brandSlug}
            >
              {brands.map((brand) => (
                <option key={brand.id} value={brand.slug}>
                  {brand.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={cn("mb-1 block text-sm font-medium", primaryText)}>Search</label>
            <div className="flex gap-2">
              <Input
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") void loadCustomers();
                }}
                placeholder="Name, email, phone"
                value={query}
              />
              <Button onClick={() => void loadCustomers()} type="button">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div>
            <label className={cn("mb-1 block text-sm font-medium", primaryText)}>Tag</label>
            <select
              className="flex h-11 w-full rounded-xl border border-zinc-200/70 bg-white px-4 text-sm dark:border-white/10 dark:bg-zinc-900"
              onChange={(event) => setTagFilter(event.target.value)}
              value={tagFilter}
            >
              <option value="">All tags</option>
              {tags.map((tag) => (
                <option key={tag.id} value={tag.slug}>
                  {tag.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={cn("mb-1 block text-sm font-medium", primaryText)}>Segment</label>
            <select
              className="flex h-11 w-full rounded-xl border border-zinc-200/70 bg-white px-4 text-sm dark:border-white/10 dark:bg-zinc-900"
              onChange={(event) => setSegmentFilter(event.target.value)}
              value={segmentFilter}
            >
              <option value="">All customers</option>
              {segments.map((segment) => (
                <option key={segment.id} value={segment.id}>
                  {segment.name}
                  {typeof segment.memberCount === "number" ? ` (${segment.memberCount})` : ""}
                </option>
              ))}
            </select>
          </div>
        </div>
        {error ? <p className="text-sm text-red-500">{error}</p> : null}
        {success ? <p className="text-sm text-emerald-600">{success}</p> : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <section className={cn("overflow-hidden", dashboardGlass)}>
          <div className="border-b border-zinc-200/50 px-5 py-4 dark:border-white/10">
            <h3 className={cn("font-display text-lg font-semibold", primaryText)}>
              Customer list
            </h3>
            <p className={cn("text-xs", secondaryText)}>{total} customer(s)</p>
          </div>
          {isLoading ? (
            <div className="flex min-h-[16rem] items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-[#d81b60]" />
            </div>
          ) : customers.length === 0 ? (
            <p className={cn("p-6 text-sm", secondaryText)}>
              No customers yet. Place orders or run Backfill from orders.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className={cn("text-xs uppercase tracking-wide", secondaryText)}>
                  <tr className="border-b border-zinc-200/50 dark:border-white/10">
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Contact</th>
                    <th className="px-4 py-3">Orders</th>
                    <th className="px-4 py-3">Spend</th>
                    <th className="px-4 py-3">Tags</th>
                    <th className="px-4 py-3">Consent</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => (
                    <tr
                      className={cn(
                        "cursor-pointer border-b border-zinc-200/40 last:border-0 hover:bg-[#d81b60]/5 dark:border-white/5",
                        selectedId === customer.id ? "bg-[#d81b60]/5" : "",
                      )}
                      key={customer.id}
                      onClick={() => void openProfile(customer.id)}
                    >
                      <td className={cn("px-4 py-3 font-medium", primaryText)}>
                        {customer.name || "—"}
                      </td>
                      <td className={cn("px-4 py-3 text-xs", secondaryText)}>
                        <div>{customer.phone || "—"}</div>
                        <div>{customer.email || "—"}</div>
                      </td>
                      <td className={cn("px-4 py-3", secondaryText)}>{customer.orderCount}</td>
                      <td className="px-4 py-3 font-semibold text-[#d81b60]">
                        {formatMoney(customer.totalSpent)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {customer.tags.map((tag) => (
                            <span
                              className="rounded-full px-2 py-0.5 text-[10px] font-semibold text-white"
                              key={tag.id}
                              style={{ backgroundColor: tag.color || "#d81b60" }}
                            >
                              {tag.label}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className={cn("px-4 py-3 text-xs", secondaryText)}>
                        {customer.marketingEmailOptIn ? "Email" : ""}
                        {customer.marketingEmailOptIn && customer.marketingSmsOptIn ? " · " : ""}
                        {customer.marketingSmsOptIn ? "SMS" : ""}
                        {!customer.marketingEmailOptIn && !customer.marketingSmsOptIn ? "—" : ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className={cn("overflow-hidden", dashboardGlass)}>
          <div className="border-b border-zinc-200/50 px-5 py-4 dark:border-white/10">
            <h3 className={cn("font-display text-lg font-semibold", primaryText)}>Profile</h3>
          </div>
          {!selectedId ? (
            <p className={cn("p-6 text-sm", secondaryText)}>Select a customer to view details.</p>
          ) : isLoadingProfile || !profile ? (
            <div className="flex min-h-[16rem] items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-[#d81b60]" />
            </div>
          ) : (
            <div className="space-y-4 p-5">
              <div>
                <label className={cn("mb-1 block text-xs font-medium", secondaryText)}>Name</label>
                <Input
                  onChange={(event) => setProfile({ ...profile, name: event.target.value })}
                  value={profile.name ?? ""}
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className={cn("text-xs", secondaryText)}>Phone</p>
                  <p className={cn("text-sm font-medium", primaryText)}>{profile.phone || "—"}</p>
                </div>
                <div>
                  <p className={cn("text-xs", secondaryText)}>Email</p>
                  <p className={cn("text-sm font-medium", primaryText)}>{profile.email || "—"}</p>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <p className={cn("text-xs", secondaryText)}>Orders</p>
                  <p className={cn("text-lg font-bold", primaryText)}>{profile.orderCount}</p>
                </div>
                <div>
                  <p className={cn("text-xs", secondaryText)}>Spend</p>
                  <p className="text-lg font-bold text-[#d81b60]">
                    {formatMoney(profile.totalSpent)}
                  </p>
                </div>
                <div>
                  <p className={cn("text-xs", secondaryText)}>Last order</p>
                  <p className={cn("text-sm", primaryText)}>{formatDate(profile.lastOrderAt)}</p>
                </div>
              </div>
              <div>
                <label className={cn("mb-1 block text-xs font-medium", secondaryText)}>Notes</label>
                <textarea
                  className="min-h-[80px] w-full rounded-xl border border-zinc-200/70 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-zinc-900"
                  onChange={(event) => setProfile({ ...profile, notes: event.target.value })}
                  value={profile.notes ?? ""}
                />
              </div>
              <div className="space-y-2">
                <p className={cn("text-xs font-medium", secondaryText)}>Marketing consent</p>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    checked={profile.marketingEmailOptIn}
                    onChange={(event) =>
                      setProfile({ ...profile, marketingEmailOptIn: event.target.checked })
                    }
                    type="checkbox"
                  />
                  <span className={primaryText}>Email opt-in</span>
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    checked={profile.marketingSmsOptIn}
                    onChange={(event) =>
                      setProfile({ ...profile, marketingSmsOptIn: event.target.checked })
                    }
                    type="checkbox"
                  />
                  <span className={primaryText}>SMS opt-in</span>
                </label>
              </div>
              <div>
                <p className={cn("mb-2 text-xs font-medium", secondaryText)}>Tags</p>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => {
                    const active = profile.tags.some((row) => row.id === tag.id);
                    return (
                      <button
                        className={cn(
                          "rounded-full px-3 py-1 text-xs font-semibold",
                          active ? "text-white" : "border border-zinc-300 text-zinc-600",
                        )}
                        key={tag.id}
                        onClick={() => toggleProfileTag(tag)}
                        style={active ? { backgroundColor: tag.color || "#d81b60" } : undefined}
                        type="button"
                      >
                        {tag.label}
                      </button>
                    );
                  })}
                  {tags.length === 0 ? (
                    <p className={cn("text-xs", secondaryText)}>Create tags to assign them.</p>
                  ) : null}
                </div>
              </div>
              <Button disabled={isSaving} onClick={() => void saveProfile()} type="button">
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save profile
              </Button>

              <div>
                <p className={cn("mb-2 text-xs font-medium", secondaryText)}>Recent orders</p>
                <div className="max-h-48 space-y-2 overflow-y-auto">
                  {(profile.orders ?? []).map((order) => (
                    <div
                      className="rounded-xl border border-zinc-200/60 px-3 py-2 text-xs dark:border-white/10"
                      key={order.id}
                    >
                      <div className="flex justify-between gap-2">
                        <span className={primaryText}>{formatDate(order.createdAt)}</span>
                        <span className="font-semibold text-[#d81b60]">
                          {formatMoney(order.total)}
                        </span>
                      </div>
                      <p className={secondaryText}>
                        {order.status} · {order.paymentStatus}
                        {order.location?.name ? ` · ${order.location.name}` : ""}
                      </p>
                    </div>
                  ))}
                  {(profile.orders ?? []).length === 0 ? (
                    <p className={cn("text-xs", secondaryText)}>No linked orders.</p>
                  ) : null}
                </div>
              </div>
            </div>
          )}
        </section>
      </div>

      <Dialog.Root onOpenChange={setTagsOpen} open={tagsOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
          <Dialog.Content
            className={cn(
              "fixed left-1/2 top-1/2 z-50 w-[min(96vw,28rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border p-6",
              dashboardGlass,
            )}
          >
            <div className="flex items-center justify-between">
              <Dialog.Title className={cn("font-display text-xl font-bold", primaryText)}>
                Tags
              </Dialog.Title>
              <button onClick={() => setTagsOpen(false)} type="button">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-4 flex gap-2">
              <Input
                onChange={(event) => setNewTagLabel(event.target.value)}
                placeholder="New tag label"
                value={newTagLabel}
              />
              <Button disabled={isSaving || !newTagLabel.trim()} onClick={() => void handleCreateTag()}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-4 space-y-2">
              {tags.map((tag) => (
                <div
                  className="flex items-center justify-between rounded-xl border border-zinc-200/60 px-3 py-2 dark:border-white/10"
                  key={tag.id}
                >
                  <span className={cn("text-sm font-medium", primaryText)}>{tag.label}</span>
                  <Button
                    onClick={() => {
                      void (async () => {
                        await deleteCrmTag(token, tag.id);
                        await loadMeta();
                        await loadCustomers();
                      })();
                    }}
                    type="button"
                    variant="ghost"
                  >
                    Delete
                  </Button>
                </div>
              ))}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <Dialog.Root onOpenChange={setSegmentsOpen} open={segmentsOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
          <Dialog.Content
            className={cn(
              "fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[min(96vw,36rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border p-6",
              dashboardGlass,
            )}
          >
            <div className="flex items-center justify-between">
              <Dialog.Title className={cn("font-display text-xl font-bold", primaryText)}>
                Segments
              </Dialog.Title>
              <button onClick={() => setSegmentsOpen(false)} type="button">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <Input
                onChange={(event) =>
                  setSegmentForm((current) => ({ ...current, name: event.target.value }))
                }
                placeholder="Segment name"
                value={segmentForm.name}
              />
              <Input
                onChange={(event) =>
                  setSegmentForm((current) => ({ ...current, description: event.target.value }))
                }
                placeholder="Description (optional)"
                value={segmentForm.description}
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  onChange={(event) =>
                    setSegmentForm((current) => ({
                      ...current,
                      rules: {
                        ...current.rules,
                        minOrders: event.target.value ? Number(event.target.value) : undefined,
                      },
                    }))
                  }
                  placeholder="Min orders"
                  type="number"
                  value={segmentForm.rules.minOrders ?? ""}
                />
                <Input
                  onChange={(event) =>
                    setSegmentForm((current) => ({
                      ...current,
                      rules: {
                        ...current.rules,
                        minSpend: event.target.value ? Number(event.target.value) : undefined,
                      },
                    }))
                  }
                  placeholder="Min spend ($)"
                  type="number"
                  value={segmentForm.rules.minSpend ?? ""}
                />
                <Input
                  onChange={(event) =>
                    setSegmentForm((current) => ({
                      ...current,
                      rules: {
                        ...current.rules,
                        lastOrderWithinDays: event.target.value
                          ? Number(event.target.value)
                          : undefined,
                      },
                    }))
                  }
                  placeholder="Ordered within days"
                  type="number"
                  value={segmentForm.rules.lastOrderWithinDays ?? ""}
                />
                <Input
                  onChange={(event) =>
                    setSegmentForm((current) => ({
                      ...current,
                      rules: {
                        ...current.rules,
                        lastOrderBeforeDays: event.target.value
                          ? Number(event.target.value)
                          : undefined,
                      },
                    }))
                  }
                  placeholder="Last order before days"
                  type="number"
                  value={segmentForm.rules.lastOrderBeforeDays ?? ""}
                />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  checked={segmentForm.rules.marketingEmailOptIn === true}
                  onChange={(event) =>
                    setSegmentForm((current) => ({
                      ...current,
                      rules: {
                        ...current.rules,
                        marketingEmailOptIn: event.target.checked ? true : undefined,
                      },
                    }))
                  }
                  type="checkbox"
                />
                <span className={primaryText}>Email opt-in only</span>
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  checked={segmentForm.rules.marketingSmsOptIn === true}
                  onChange={(event) =>
                    setSegmentForm((current) => ({
                      ...current,
                      rules: {
                        ...current.rules,
                        marketingSmsOptIn: event.target.checked ? true : undefined,
                      },
                    }))
                  }
                  type="checkbox"
                />
                <span className={primaryText}>SMS opt-in only</span>
              </label>
              <Button
                disabled={isSaving || !segmentForm.name.trim()}
                onClick={() => void handleCreateSegment()}
                type="button"
              >
                Create segment
              </Button>
            </div>

            <div className="mt-6 space-y-2">
              {segments.map((segment) => (
                <div
                  className="flex items-center justify-between gap-3 rounded-xl border border-zinc-200/60 px-3 py-2 dark:border-white/10"
                  key={segment.id}
                >
                  <div>
                    <p className={cn("text-sm font-medium", primaryText)}>{segment.name}</p>
                    <p className={cn("text-xs", secondaryText)}>
                      {segment.memberCount ?? 0} members
                      {segment.description ? ` · ${segment.description}` : ""}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        setSegmentFilter(segment.id);
                        setSegmentsOpen(false);
                      }}
                      type="button"
                      variant="outline"
                    >
                      View
                    </Button>
                    <Button
                      onClick={() => {
                        void (async () => {
                          await deleteCrmSegment(token, segment.id);
                          if (segmentFilter === segment.id) setSegmentFilter("");
                          await loadMeta();
                        })();
                      }}
                      type="button"
                      variant="ghost"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
