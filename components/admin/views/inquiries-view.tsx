"use client";

import { fetchInquiries, updateInquiryStatus } from "@/lib/inquiries-api";
import { dashboardGlass, primaryText, secondaryText } from "@/lib/theme-classes";
import type { StoreInquiry } from "@/types/inquiry";
import { cn } from "@/lib/utils";
import { useCallback, useEffect, useState } from "react";

interface InquiriesViewProps {
  token: string;
  brandSlug?: string;
}

const TYPE_LABELS: Record<StoreInquiry["type"], string> = {
  CONTACT: "Contact",
  CAREERS: "Careers",
  CATERING: "Catering",
};

export function InquiriesView({ token, brandSlug }: InquiriesViewProps): React.ReactElement {
  const [inquiries, setInquiries] = useState<StoreInquiry[]>([]);
  const [filter, setFilter] = useState<"all" | "NEW" | "READ" | "ARCHIVED">("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const rows = await fetchInquiries(token, brandSlug);
      setInquiries(rows);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load inquiries.");
    } finally {
      setIsLoading(false);
    }
  }, [token, brandSlug]);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = inquiries.filter((row) => filter === "all" || row.status === filter);

  const handleStatus = async (
    inquiryId: string,
    status: StoreInquiry["status"]
  ): Promise<void> => {
    const updated = await updateInquiryStatus(token, inquiryId, status, brandSlug);
    setInquiries((current) => current.map((row) => (row.id === inquiryId ? updated : row)));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {(["all", "NEW", "READ", "ARCHIVED"] as const).map((tab) => (
          <button
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors",
              filter === tab
                ? "bg-[#d81b60] text-white"
                : "border border-zinc-200/60 bg-white/60 text-zinc-600 dark:border-white/10 dark:bg-zinc-900/40 dark:text-zinc-400"
            )}
            key={tab}
            onClick={() => setFilter(tab)}
            type="button"
          >
            {tab === "all" ? "All" : tab.charAt(0) + tab.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className={cn("text-sm", secondaryText)}>Loading inquiries…</p>
      ) : error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : filtered.length === 0 ? (
        <div className={cn("p-8 text-center", dashboardGlass)}>
          <p className={cn("font-medium", primaryText)}>No inquiries yet</p>
          <p className={cn("mt-2 text-sm", secondaryText)}>
            Contact, careers, and catering form submissions will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((inquiry) => (
            <article className={cn("rounded-2xl p-6", dashboardGlass)} key={inquiry.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[#d81b60]/15 px-3 py-1 text-xs font-semibold text-[#d81b60]">
                      {TYPE_LABELS[inquiry.type]}
                    </span>
                    <span className="text-xs uppercase tracking-wide text-zinc-500">
                      {inquiry.status}
                    </span>
                  </div>
                  <h3 className={cn("mt-2 text-lg font-bold", primaryText)}>{inquiry.name}</h3>
                  <p className={cn("text-sm", secondaryText)}>
                    {inquiry.email}
                    {inquiry.phone ? ` · ${inquiry.phone}` : ""}
                  </p>
                  {inquiry.subject ? (
                    <p className={cn("mt-1 text-sm font-medium", primaryText)}>{inquiry.subject}</p>
                  ) : null}
                </div>
                <time className="text-xs text-zinc-500">
                  {new Date(inquiry.createdAt).toLocaleString("en-AU")}
                </time>
              </div>
              <p className={cn("mt-4 whitespace-pre-wrap text-sm", secondaryText)}>
                {inquiry.message}
              </p>
              {inquiry.payload ? (
                <pre className="mt-4 overflow-x-auto rounded-xl bg-zinc-100 p-3 text-xs dark:bg-zinc-900">
                  {JSON.stringify(inquiry.payload, null, 2)}
                </pre>
              ) : null}
              <div className="mt-4 flex flex-wrap gap-2">
                {inquiry.status !== "READ" ? (
                  <button
                    className="rounded-full border px-4 py-2 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    onClick={() => void handleStatus(inquiry.id, "READ")}
                    type="button"
                  >
                    Mark read
                  </button>
                ) : null}
                {inquiry.status !== "ARCHIVED" ? (
                  <button
                    className="rounded-full border px-4 py-2 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    onClick={() => void handleStatus(inquiry.id, "ARCHIVED")}
                    type="button"
                  >
                    Archive
                  </button>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
