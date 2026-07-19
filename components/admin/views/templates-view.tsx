"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Copy, Loader2, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchMenuTemplates, createMenuTemplate, applyMenuTemplate } from "@/lib/admin-api";
import { dashboardGlass, primaryText, secondaryText } from "@/lib/theme-classes";
import type { HqMenuTemplate } from "@/types/hq";
import type { Brand } from "@/types/brand";
import { cn } from "@/lib/utils";

interface TemplatesViewProps {
  token: string;
  brands: Brand[];
}

interface CreateFormState {
  name: string;
  description: string;
  sourceBrandSlug: string;
  lockItems: boolean;
}

interface ApplyFormState {
  templateId: string;
  targetSlugs: Set<string>;
  lockItems: boolean;
}

function emptyCreateForm(brands: Brand[]): CreateFormState {
  return {
    name: "",
    description: "",
    sourceBrandSlug: brands[0]?.slug ?? "",
    lockItems: false,
  };
}

function emptyApplyForm(): ApplyFormState {
  return {
    templateId: "",
    targetSlugs: new Set(),
    lockItems: false,
  };
}

export function TemplatesView({ token, brands }: TemplatesViewProps): React.ReactElement {
  const [templates, setTemplates] = useState<HqMenuTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [createForm, setCreateForm] = useState<CreateFormState>(() => emptyCreateForm(brands));
  const [applyForm, setApplyForm] = useState<ApplyFormState>(emptyApplyForm);

  const loadTemplates = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchMenuTemplates(token);
      setTemplates(data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load templates.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadTemplates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleCreate = async (): Promise<void> => {
    setIsSaving(true);
    setError(null);

    try {
      await createMenuTemplate(token, {
        name: createForm.name.trim(),
        description: createForm.description.trim() || undefined,
        sourceBrandSlug: createForm.sourceBrandSlug,
        lockItems: createForm.lockItems,
      });
      await loadTemplates();
      setIsCreateModalOpen(false);
      setCreateForm(emptyCreateForm(brands));
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Unable to create template.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleApply = async (): Promise<void> => {
    setIsSaving(true);
    setError(null);

    try {
      await applyMenuTemplate(
        token,
        applyForm.templateId,
        Array.from(applyForm.targetSlugs),
        applyForm.lockItems
      );
      setIsApplyModalOpen(false);
      setApplyForm(emptyApplyForm());
    } catch (applyError) {
      setError(applyError instanceof Error ? applyError.message : "Unable to apply template.");
    } finally {
      setIsSaving(false);
    }
  };

  const openApplyModal = (template: HqMenuTemplate): void => {
    setApplyForm({
      templateId: template.id,
      targetSlugs: new Set(),
      lockItems: false,
    });
    setError(null);
    setIsApplyModalOpen(true);
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
          <h2 className={cn("font-display text-2xl font-bold", primaryText)}>Menu Templates</h2>
          <p className={cn("mt-1 text-sm", secondaryText)}>
            Create and apply standardized menus across multiple stores
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Template
        </Button>
      </div>

      <div className="space-y-3">
        {templates.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-300/70 p-8 text-center dark:border-white/10">
            <p className={cn("text-sm", secondaryText)}>No templates yet.</p>
          </div>
        ) : (
          templates.map((template) => (
            <div
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-200/60 bg-white/50 px-4 py-3 dark:border-white/10 dark:bg-zinc-900/30"
              key={template.id}
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className={cn("font-medium", primaryText)}>{template.name}</p>
                  {template.sourceBrand ? (
                    <span className="rounded-full bg-[#d81b60]/10 px-2 py-0.5 text-xs font-semibold text-[#d81b60]">
                      {template.sourceBrand.name}
                    </span>
                  ) : null}
                </div>
                <p className={cn("mt-1 text-xs", secondaryText)}>
                  {template.description || "No description"}
                </p>
              </div>
              <Button onClick={() => openApplyModal(template)} size="icon" variant="ghost">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
      </div>

      <Dialog.Root onOpenChange={setIsCreateModalOpen} open={isCreateModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
          <Dialog.Content
            className={cn(
              "fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[min(96vw,32rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl p-6 shadow-2xl",
              dashboardGlass
            )}
          >
            <Dialog.Title className={cn("font-display text-xl font-bold", primaryText)}>
              Create Template
            </Dialog.Title>
            <div className="mt-6 space-y-4">
              <div>
                <label className={cn("mb-1 block text-sm font-medium", primaryText)}>Name</label>
                <Input
                  onChange={(event) =>
                    setCreateForm((current) => ({ ...current, name: event.target.value }))
                  }
                  placeholder="e.g. Standard Pizza Menu"
                  value={createForm.name}
                />
              </div>
              <div>
                <label className={cn("mb-1 block text-sm font-medium", primaryText)}>
                  Description
                </label>
                <textarea
                  className="flex min-h-[80px] w-full rounded-xl border border-zinc-200/70 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-zinc-900"
                  onChange={(event) =>
                    setCreateForm((current) => ({ ...current, description: event.target.value }))
                  }
                  value={createForm.description}
                />
              </div>
              <div>
                <label className={cn("mb-1 block text-sm font-medium", primaryText)}>
                  Source store
                </label>
                <select
                  className="flex h-11 w-full rounded-xl border border-zinc-200/70 bg-white px-4 text-sm dark:border-white/10 dark:bg-zinc-900"
                  onChange={(event) =>
                    setCreateForm((current) => ({ ...current, sourceBrandSlug: event.target.value }))
                  }
                  value={createForm.sourceBrandSlug}
                >
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.slug}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  checked={createForm.lockItems}
                  onChange={(event) =>
                    setCreateForm((current) => ({ ...current, lockItems: event.target.checked }))
                  }
                  type="checkbox"
                />
                <span className={primaryText}>Lock menu items</span>
              </label>
              {error ? <p className="text-sm text-red-500">{error}</p> : null}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Button onClick={() => setIsCreateModalOpen(false)} variant="ghost">
                Cancel
              </Button>
              <Button
                disabled={isSaving || !createForm.name.trim() || !createForm.sourceBrandSlug}
                onClick={() => void handleCreate()}
              >
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Create
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <Dialog.Root onOpenChange={setIsApplyModalOpen} open={isApplyModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
          <Dialog.Content
            className={cn(
              "fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[min(96vw,32rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl p-6 shadow-2xl",
              dashboardGlass
            )}
          >
            <Dialog.Title className={cn("font-display text-xl font-bold", primaryText)}>
              Apply Template
            </Dialog.Title>
            <div className="mt-6 space-y-4">
              <div>
                <label className={cn("mb-2 block text-sm font-medium", primaryText)}>
                  Target stores
                </label>
                <div className="space-y-2">
                  {brands.map((brand) => (
                    <label className="flex items-center gap-2 text-sm" key={brand.id}>
                      <input
                        checked={applyForm.targetSlugs.has(brand.slug)}
                        onChange={(event) => {
                          const next = new Set(applyForm.targetSlugs);
                          if (event.target.checked) {
                            next.add(brand.slug);
                          } else {
                            next.delete(brand.slug);
                          }
                          setApplyForm((current) => ({ ...current, targetSlugs: next }));
                        }}
                        type="checkbox"
                      />
                      <span className={primaryText}>{brand.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  checked={applyForm.lockItems}
                  onChange={(event) =>
                    setApplyForm((current) => ({ ...current, lockItems: event.target.checked }))
                  }
                  type="checkbox"
                />
                <span className={primaryText}>Lock items on target stores</span>
              </label>
              {error ? <p className="text-sm text-red-500">{error}</p> : null}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Button onClick={() => setIsApplyModalOpen(false)} variant="ghost">
                Cancel
              </Button>
              <Button
                disabled={isSaving || applyForm.targetSlugs.size === 0}
                onClick={() => void handleApply()}
              >
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Apply to {applyForm.targetSlugs.size} store{applyForm.targetSlugs.size !== 1 ? "s" : ""}
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
