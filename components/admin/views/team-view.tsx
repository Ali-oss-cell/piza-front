"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Loader2, Pencil, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchTeam, inviteTeamMember, updateTeamMember } from "@/lib/admin-api";
import { dashboardGlass, primaryText, secondaryText } from "@/lib/theme-classes";
import type { TeamMembership } from "@/types/hq";
import { cn } from "@/lib/utils";

interface TeamViewProps {
  token: string;
  brandSlug: string;
}

interface InviteFormState {
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

function emptyForm(): InviteFormState {
  return {
    email: "",
    firstName: "",
    lastName: "",
    role: "STAFF",
  };
}

export function TeamView({ token, brandSlug }: TeamViewProps): React.ReactElement {
  const [members, setMembers] = useState<TeamMembership[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState<InviteFormState>(emptyForm);
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadTeam = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchTeam(token, brandSlug);
      setMembers(data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load team.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadTeam();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, brandSlug]);

  const handleInvite = async (): Promise<void> => {
    setIsSaving(true);
    setError(null);

    try {
      await inviteTeamMember(token, {
        email: form.email.trim(),
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        role: form.role,
        brandSlug,
      });
      await loadTeam();
      setIsModalOpen(false);
      setForm(emptyForm());
    } catch (inviteError) {
      setError(inviteError instanceof Error ? inviteError.message : "Unable to invite member.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (member: TeamMembership): Promise<void> => {
    setBusyId(member.id);
    try {
      await updateTeamMember(token, member.id, { isActive: !member.isActive });
      await loadTeam();
    } finally {
      setBusyId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#d81b60]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className={cn("font-display text-2xl font-bold", primaryText)}>Team</h2>
          <p className={cn("mt-1 text-sm", secondaryText)}>
            Invite staff for this store. Staff = POS only; Store Admin can also manage the dashboard.
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Invite Member
        </Button>
      </div>

      <div className="space-y-3">
        {members.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-300/70 p-8 text-center dark:border-white/10">
            <p className={cn("text-sm", secondaryText)}>No team members yet.</p>
          </div>
        ) : (
          members.map((member) => (
            <div
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-200/60 bg-white/50 px-4 py-3 dark:border-white/10 dark:bg-zinc-900/30"
              key={member.id}
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className={cn("font-medium", primaryText)}>
                    {member.user.firstName} {member.user.lastName}
                  </p>
                  <span className="rounded-full bg-[#d81b60]/10 px-2 py-0.5 text-xs font-semibold text-[#d81b60]">
                    {member.role}
                  </span>
                </div>
                <p className={cn("mt-1 text-xs", secondaryText)}>
                  {member.user.email}
                  {member.location ? ` · ${member.location.name}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium",
                    member.isActive
                      ? "bg-emerald-500/15 text-emerald-600"
                      : "bg-zinc-500/15 text-zinc-500"
                  )}
                  disabled={busyId === member.id}
                  onClick={() => void handleToggleActive(member)}
                  type="button"
                >
                  {member.isActive ? "Active" : "Inactive"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <Dialog.Root onOpenChange={setIsModalOpen} open={isModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
          <Dialog.Content
            className={cn(
              "fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[min(96vw,32rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl p-6 shadow-2xl",
              dashboardGlass
            )}
          >
            <Dialog.Title className={cn("font-display text-xl font-bold", primaryText)}>
              Invite Team Member
            </Dialog.Title>
            <div className="mt-6 space-y-4">
              <div>
                <label className={cn("mb-1 block text-sm font-medium", primaryText)}>Email</label>
                <Input
                  onChange={(event) =>
                    setForm((current) => ({ ...current, email: event.target.value }))
                  }
                  type="email"
                  value={form.email}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={cn("mb-1 block text-sm font-medium", primaryText)}>
                    First name
                  </label>
                  <Input
                    onChange={(event) =>
                      setForm((current) => ({ ...current, firstName: event.target.value }))
                    }
                    value={form.firstName}
                  />
                </div>
                <div>
                  <label className={cn("mb-1 block text-sm font-medium", primaryText)}>
                    Last name
                  </label>
                  <Input
                    onChange={(event) =>
                      setForm((current) => ({ ...current, lastName: event.target.value }))
                    }
                    value={form.lastName}
                  />
                </div>
              </div>
              <div>
                <label className={cn("mb-1 block text-sm font-medium", primaryText)}>Role</label>
                <select
                  className="flex h-11 w-full rounded-xl border border-zinc-200/70 bg-white px-4 text-sm dark:border-white/10 dark:bg-zinc-900"
                  onChange={(event) =>
                    setForm((current) => ({ ...current, role: event.target.value }))
                  }
                  value={form.role}
                >
                  <option value="STAFF">Staff (POS only for this store)</option>
                  <option value="STORE_ADMIN">Store Admin</option>
                </select>
                <p className={cn("mt-1 text-xs", secondaryText)}>
                  Use Staff for floor tablets so they only access this store&apos;s POS.
                </p>
              </div>
              {error ? <p className="text-sm text-red-500">{error}</p> : null}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Button onClick={() => setIsModalOpen(false)} variant="ghost">
                Cancel
              </Button>
              <Button
                disabled={
                  isSaving ||
                  !form.email.trim() ||
                  !form.firstName.trim() ||
                  !form.lastName.trim()
                }
                onClick={() => void handleInvite()}
              >
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Send Invite
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
