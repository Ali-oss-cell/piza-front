"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Loader2, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  fetchHqMemberships,
  inviteHqMember,
  updateHqMembership,
} from "@/lib/admin-api";
import { dashboardGlass, primaryText, secondaryText } from "@/lib/theme-classes";
import type { Brand } from "@/types/brand";
import type { TeamMembership } from "@/types/hq";
import { cn } from "@/lib/utils";

interface PeopleViewProps {
  token: string;
  brands: Brand[];
}

interface InviteFormState {
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  brandSlugs: Set<string>;
}

function emptyForm(brands: Brand[]): InviteFormState {
  return {
    email: "",
    firstName: "",
    lastName: "",
    role: "STORE_ADMIN",
    brandSlugs: new Set(brands[0] ? [brands[0].slug] : []),
  };
}

export function PeopleView({ token, brands }: PeopleViewProps): React.ReactElement {
  const [members, setMembers] = useState<TeamMembership[]>([]);
  const [brandFilter, setBrandFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [form, setForm] = useState<InviteFormState>(() => emptyForm(brands));

  const loadMembers = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchHqMemberships(token, brandFilter || undefined);
      setMembers(data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load people.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, brandFilter]);

  const visibleMembers = useMemo(() => members, [members]);

  const handleInvite = async (): Promise<void> => {
    if (form.brandSlugs.size === 0) {
      setError("Select at least one store.");
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const result = await inviteHqMember(token, {
        email: form.email.trim(),
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        role: form.role,
        brandSlugs: Array.from(form.brandSlugs),
      });
      const passwordNote = result.temporaryPassword
        ? ` Temporary password: ${result.temporaryPassword}`
        : "";
      setSuccess(
        `Invited to ${result.invited.length} store(s).${
          result.failed.length
            ? ` Failed: ${result.failed.map((row) => row.slug).join(", ")}.`
            : ""
        }${passwordNote}`,
      );
      setIsModalOpen(false);
      setForm(emptyForm(brands));
      await loadMembers();
    } catch (inviteError) {
      setError(inviteError instanceof Error ? inviteError.message : "Invite failed.");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleActive = async (member: TeamMembership): Promise<void> => {
    setBusyId(member.id);
    setError(null);
    try {
      await updateHqMembership(token, member.id, { isActive: !member.isActive });
      await loadMembers();
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Update failed.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className={cn("font-display text-2xl font-bold", primaryText)}>People</h2>
          <p className={cn("mt-1 text-sm", secondaryText)}>
            Invite and deactivate store managers across the network
          </p>
        </div>
        <Button
          onClick={() => {
            setForm(emptyForm(brands));
            setIsModalOpen(true);
          }}
          type="button"
        >
          <Plus className="mr-2 h-4 w-4" />
          Invite
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className={cn("text-sm font-medium", primaryText)}>Store filter</label>
        <select
          className="h-10 rounded-xl border border-zinc-200/70 bg-white px-3 text-sm dark:border-white/10 dark:bg-zinc-900"
          onChange={(event) => setBrandFilter(event.target.value)}
          value={brandFilter}
        >
          <option value="">All stores</option>
          {brands.map((brand) => (
            <option key={brand.id} value={brand.slug}>
              {brand.name}
            </option>
          ))}
        </select>
      </div>

      {error ? <p className="text-sm text-red-500">{error}</p> : null}
      {success ? <p className="text-sm text-emerald-600">{success}</p> : null}

      {isLoading ? (
        <div className="flex min-h-[20vh] items-center justify-center">
          <Loader2 className="h-7 w-7 animate-spin text-[#d81b60]" />
        </div>
      ) : (
        <div className="space-y-2">
          {visibleMembers.length === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-300/70 p-8 text-center dark:border-white/10">
              <p className={cn("text-sm", secondaryText)}>No memberships yet.</p>
            </div>
          ) : (
            visibleMembers.map((member) => (
              <div
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-200/60 bg-white/50 px-4 py-3 dark:border-white/10 dark:bg-zinc-900/30"
                key={member.id}
              >
                <div className="min-w-0">
                  <p className={cn("font-medium", primaryText)}>
                    {member.user.firstName} {member.user.lastName}
                  </p>
                  <p className={cn("text-xs", secondaryText)}>
                    {member.user.email} · {member.role}
                    {member.store ? ` · ${member.store.name}` : ""}
                    {!member.isActive ? " · inactive" : ""}
                  </p>
                </div>
                <Button
                  disabled={busyId === member.id || member.role === "PLATFORM_ADMIN"}
                  onClick={() => void toggleActive(member)}
                  type="button"
                  variant="outline"
                >
                  {busyId === member.id ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  {member.isActive ? "Deactivate" : "Reactivate"}
                </Button>
              </div>
            ))
          )}
        </div>
      )}

      <Dialog.Root onOpenChange={setIsModalOpen} open={isModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
          <Dialog.Content
            className={cn(
              "fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[min(96vw,32rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border p-6",
              dashboardGlass,
            )}
          >
            <Dialog.Title className={cn("font-display text-xl font-bold", primaryText)}>
              Invite store manager
            </Dialog.Title>
            <div className="mt-5 space-y-3">
              <Input
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                placeholder="Email"
                type="email"
                value={form.email}
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  onChange={(event) =>
                    setForm((current) => ({ ...current, firstName: event.target.value }))
                  }
                  placeholder="First name"
                  value={form.firstName}
                />
                <Input
                  onChange={(event) =>
                    setForm((current) => ({ ...current, lastName: event.target.value }))
                  }
                  placeholder="Last name"
                  value={form.lastName}
                />
              </div>
              <select
                className="flex h-11 w-full rounded-xl border border-zinc-200/70 bg-white px-4 text-sm dark:border-white/10 dark:bg-zinc-900"
                onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))}
                value={form.role}
              >
                <option value="STORE_ADMIN">Store admin</option>
                <option value="STAFF">Staff</option>
              </select>
              <div>
                <p className={cn("mb-2 text-sm font-medium", primaryText)}>Stores</p>
                <div className="max-h-40 space-y-2 overflow-y-auto">
                  {brands.map((brand) => (
                    <label className="flex items-center gap-2 text-sm" key={brand.id}>
                      <input
                        checked={form.brandSlugs.has(brand.slug)}
                        onChange={() => {
                          setForm((current) => {
                            const next = new Set(current.brandSlugs);
                            if (next.has(brand.slug)) next.delete(brand.slug);
                            else next.add(brand.slug);
                            return { ...current, brandSlugs: next };
                          });
                        }}
                        type="checkbox"
                      />
                      <span className={primaryText}>{brand.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Button onClick={() => setIsModalOpen(false)} type="button" variant="ghost">
                Cancel
              </Button>
              <Button
                disabled={
                  isSaving ||
                  !form.email.trim() ||
                  !form.firstName.trim() ||
                  !form.lastName.trim() ||
                  form.brandSlugs.size === 0
                }
                onClick={() => void handleInvite()}
                type="button"
              >
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Invite
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
