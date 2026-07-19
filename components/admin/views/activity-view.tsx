"use client";

import { Activity, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchHqActivity } from "@/lib/admin-api";
import { dashboardGlass, primaryText, secondaryText } from "@/lib/theme-classes";
import type { HqAuditEvent } from "@/types/hq";
import { cn } from "@/lib/utils";

interface ActivityViewProps {
  token: string;
}

export function ActivityView({ token }: ActivityViewProps): React.ReactElement {
  const [events, setEvents] = useState<HqAuditEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadActivity = async (): Promise<void> => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchHqActivity(token, { limit: 50 });
        setEvents(data);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unable to load activity.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadActivity();
  }, [token]);

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#d81b60]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-[#d81b60]/20 bg-[#d81b60]/10 p-6 text-[#d81b60]">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className={cn("font-display text-2xl font-bold", primaryText)}>Activity Log</h2>
        <p className={cn("mt-1 text-sm", secondaryText)}>
          Cross-store audit trail of admin actions
        </p>
      </div>

      <section className={cn("overflow-hidden", dashboardGlass)}>
        <div className="border-b border-zinc-200/50 px-6 py-4 dark:border-white/10">
          <h3 className={cn("font-display text-xl font-semibold", primaryText)}>Recent Events</h3>
          <p className={cn("text-sm", secondaryText)}>Last 50 admin actions</p>
        </div>
        <div className="space-y-0">
          {events.length === 0 ? (
            <div className="px-6 py-8 text-center">
              <p className={cn("text-sm", secondaryText)}>No activity recorded yet.</p>
            </div>
          ) : (
            events.map((event) => (
              <div
                className="border-b border-zinc-200/40 px-6 py-4 last:border-0 dark:border-white/5"
                key={event.id}
              >
                <div className="flex items-start gap-3">
                  <Activity className="mt-0.5 h-4 w-4 text-[#d81b60]" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className={cn("font-medium", primaryText)}>{event.action}</p>
                      {event.store ? (
                        <span className="rounded-full bg-[#d81b60]/10 px-2 py-0.5 text-xs font-semibold text-[#d81b60]">
                          {event.store.name}
                        </span>
                      ) : null}
                    </div>
                    <p className={cn("mt-1 text-sm", secondaryText)}>{event.message}</p>
                    <p className={cn("mt-1 text-xs", secondaryText)}>
                      {event.actor
                        ? `${event.actor.firstName} ${event.actor.lastName} (${event.actor.email})`
                        : "System"}
                      {" · "}
                      {new Intl.DateTimeFormat("en-AU", {
                        hour: "2-digit",
                        minute: "2-digit",
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      }).format(new Date(event.createdAt))}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
