"use client";

import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchStoreOpsReport, type StoreOpsReport } from "@/lib/admin-api";
import { dashboardGlass, primaryText, secondaryText } from "@/lib/theme-classes";
import { cn } from "@/lib/utils";

interface StoreReportsViewProps {
  token: string;
  brandSlug: string;
}

function formatMoney(value: number): string {
  return `$${Number(value || 0).toFixed(2)}`;
}

function defaultFrom(): string {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d.toISOString().slice(0, 10);
}

function defaultTo(): string {
  return new Date().toISOString().slice(0, 10);
}

export function StoreReportsView({
  token,
  brandSlug,
}: StoreReportsViewProps): React.ReactElement {
  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(defaultTo);
  const [report, setReport] = useState<StoreOpsReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchStoreOpsReport(token, brandSlug, {
        from: from || undefined,
        to: to || undefined,
      });
      setReport(data);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load report.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [token, brandSlug, from, to]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className={cn("font-display text-2xl font-bold", primaryText)}>
          Reports &amp; stats
        </h2>
        <p className={cn("mt-1 text-sm", secondaryText)}>
          Sales and online order accept vs refuse — so you can see if the team
          is turning too many customers away.
        </p>
      </div>

      <div className={cn("flex flex-wrap items-end gap-3 rounded-2xl border p-4", dashboardGlass)}>
        <div>
          <label className={cn("mb-1 block text-xs font-medium", secondaryText)}>
            From
          </label>
          <Input
            onChange={(e) => setFrom(e.target.value)}
            type="date"
            value={from}
          />
        </div>
        <div>
          <label className={cn("mb-1 block text-xs font-medium", secondaryText)}>
            To
          </label>
          <Input
            onChange={(e) => setTo(e.target.value)}
            type="date"
            value={to}
          />
        </div>
        <Button disabled={isLoading} onClick={() => void load()} type="button">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading
            </>
          ) : (
            "Refresh"
          )}
        </Button>
      </div>

      {error ? <p className="text-sm text-red-500">{error}</p> : null}

      {report ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className={cn("rounded-2xl border p-4", dashboardGlass)}>
              <p className={cn("text-xs uppercase tracking-wide", secondaryText)}>
                Paid orders
              </p>
              <p className={cn("mt-1 font-display text-3xl font-bold", primaryText)}>
                {report.sales.paidOrders}
              </p>
            </div>
            <div className={cn("rounded-2xl border p-4", dashboardGlass)}>
              <p className={cn("text-xs uppercase tracking-wide", secondaryText)}>
                Revenue
              </p>
              <p className={cn("mt-1 font-display text-3xl font-bold", primaryText)}>
                {formatMoney(report.sales.revenue)}
              </p>
            </div>
            <div className={cn("rounded-2xl border p-4", dashboardGlass)}>
              <p className={cn("text-xs uppercase tracking-wide", secondaryText)}>
                Online accepted
              </p>
              <p className={cn("mt-1 font-display text-3xl font-bold", primaryText)}>
                {report.online.accepted}
              </p>
            </div>
            <div className={cn("rounded-2xl border p-4", dashboardGlass)}>
              <p className={cn("text-xs uppercase tracking-wide", secondaryText)}>
                Refuse rate
              </p>
              <p
                className={cn(
                  "mt-1 font-display text-3xl font-bold",
                  report.online.refuseRate >= 15
                    ? "text-red-500"
                    : primaryText,
                )}
              >
                {report.online.refuseRate}%
              </p>
              <p className={cn("mt-1 text-xs", secondaryText)}>
                {report.online.refused} refused / {report.online.paidOnline}{" "}
                online
              </p>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className={cn("rounded-2xl border p-5", dashboardGlass)}>
              <h3 className={cn("font-display text-lg font-bold", primaryText)}>
                By channel
              </h3>
              {report.sales.byChannel.length === 0 ? (
                <p className={cn("mt-3 text-sm", secondaryText)}>
                  No paid orders in this range.
                </p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {report.sales.byChannel.map((row) => (
                    <li
                      className="flex items-center justify-between text-sm"
                      key={row.channel}
                    >
                      <span className={primaryText}>{row.channel}</span>
                      <span className={secondaryText}>
                        {row.orders} · {formatMoney(row.revenue)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className={cn("rounded-2xl border p-5", dashboardGlass)}>
              <h3 className={cn("font-display text-lg font-bold", primaryText)}>
                Refusals by staff
              </h3>
              <p className={cn("mt-1 text-xs", secondaryText)}>
                High counts can mean the team is declining too many online
                tickets.
              </p>
              {report.online.refusalsByStaff.length === 0 ? (
                <p className={cn("mt-3 text-sm", secondaryText)}>
                  No refusals in this range.
                </p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {report.online.refusalsByStaff.map((row) => (
                    <li
                      className="flex items-center justify-between text-sm"
                      key={row.userId}
                    >
                      <span className={primaryText}>{row.name}</span>
                      <span
                        className={cn(
                          "font-semibold",
                          row.count >= 5 ? "text-red-500" : secondaryText,
                        )}
                      >
                        {row.count}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
