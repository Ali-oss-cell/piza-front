"use client";

import { Download, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchHqSalesReport, hqSalesCsvUrl } from "@/lib/admin-api";
import { dashboardGlass, primaryText, secondaryText } from "@/lib/theme-classes";
import type { HqSalesReport } from "@/types/hq";
import { cn } from "@/lib/utils";

interface HqReportsViewProps {
  token: string;
}

function formatMoney(value: number): string {
  return `$${value.toFixed(2)}`;
}

export function HqReportsView({ token }: HqReportsViewProps): React.ReactElement {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [report, setReport] = useState<HqSalesReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLoad = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchHqSalesReport(token, { from: from || undefined, to: to || undefined });
      setReport(data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load sales report.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadCsv = async (): Promise<void> => {
    try {
      const url = hqSalesCsvUrl({ from: from || undefined, to: to || undefined });
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error("CSV download failed");
      }
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `sales-report-${from || "all"}-${to || "all"}.csv`;
      link.click();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (downloadError) {
      setError(downloadError instanceof Error ? downloadError.message : "CSV download failed.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className={cn("font-display text-2xl font-bold", primaryText)}>Sales Reports</h2>
        <p className={cn("mt-1 text-sm", secondaryText)}>
          Cross-store revenue and order analytics
        </p>
      </div>

      <div className={cn("max-w-2xl space-y-4 rounded-2xl border p-6", dashboardGlass)}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={cn("mb-1 block text-sm font-medium", primaryText)}>From date</label>
            <Input
              onChange={(event) => setFrom(event.target.value)}
              type="date"
              value={from}
            />
          </div>
          <div>
            <label className={cn("mb-1 block text-sm font-medium", primaryText)}>To date</label>
            <Input
              onChange={(event) => setTo(event.target.value)}
              type="date"
              value={to}
            />
          </div>
        </div>
        <div className="flex gap-3">
          <Button disabled={isLoading} onClick={() => void handleLoad()}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Load Report
          </Button>
          {report ? (
            <Button onClick={() => void handleDownloadCsv()} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Download CSV
            </Button>
          ) : null}
        </div>
        {error ? <p className="text-sm text-red-500">{error}</p> : null}
      </div>

      {report ? (
        <>
          <section className={cn("overflow-hidden", dashboardGlass)}>
            <div className="border-b border-zinc-200/50 px-6 py-4 dark:border-white/10">
              <h3 className={cn("font-display text-xl font-semibold", primaryText)}>Totals</h3>
            </div>
            <div className="p-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className={cn("text-sm", secondaryText)}>Total Revenue</p>
                  <p className={cn("mt-1 text-2xl font-bold text-[#d81b60]")}>
                    {formatMoney(report.totals.revenue)}
                  </p>
                </div>
                <div>
                  <p className={cn("text-sm", secondaryText)}>Total Orders</p>
                  <p className={cn("mt-1 text-2xl font-bold", primaryText)}>
                    {report.totals.orderCount}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className={cn("overflow-hidden", dashboardGlass)}>
            <div className="border-b border-zinc-200/50 px-6 py-4 dark:border-white/10">
              <h3 className={cn("font-display text-xl font-semibold", primaryText)}>By Store</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className={cn("border-b border-zinc-200/50 text-xs uppercase tracking-wide dark:border-white/10", secondaryText)}>
                  <tr>
                    <th className="px-6 py-3">Store</th>
                    <th className="px-6 py-3">Revenue</th>
                    <th className="px-6 py-3">Orders</th>
                  </tr>
                </thead>
                <tbody>
                  {report.byStore.map((store) => (
                    <tr
                      className="border-b border-zinc-200/40 last:border-0 dark:border-white/5"
                      key={store.slug}
                    >
                      <td className={cn("px-6 py-4 font-medium", primaryText)}>{store.name}</td>
                      <td className={cn("px-6 py-4 font-semibold text-[#d81b60]")}>
                        {formatMoney(store.revenue)}
                      </td>
                      <td className={cn("px-6 py-4", secondaryText)}>{store.orderCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className={cn("overflow-hidden", dashboardGlass)}>
            <div className="border-b border-zinc-200/50 px-6 py-4 dark:border-white/10">
              <h3 className={cn("font-display text-xl font-semibold", primaryText)}>By Channel</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className={cn("border-b border-zinc-200/50 text-xs uppercase tracking-wide dark:border-white/10", secondaryText)}>
                  <tr>
                    <th className="px-6 py-3">Channel</th>
                    <th className="px-6 py-3">Revenue</th>
                    <th className="px-6 py-3">Orders</th>
                  </tr>
                </thead>
                <tbody>
                  {report.byChannel.map((channel) => (
                    <tr
                      className="border-b border-zinc-200/40 last:border-0 dark:border-white/5"
                      key={channel.channel}
                    >
                      <td className={cn("px-6 py-4 font-medium", primaryText)}>{channel.channel}</td>
                      <td className={cn("px-6 py-4 font-semibold text-[#d81b60]")}>
                        {formatMoney(channel.revenue)}
                      </td>
                      <td className={cn("px-6 py-4", secondaryText)}>{channel.orderCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className={cn("overflow-hidden", dashboardGlass)}>
            <div className="border-b border-zinc-200/50 px-6 py-4 dark:border-white/10">
              <h3 className={cn("font-display text-xl font-semibold", primaryText)}>Daily</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className={cn("border-b border-zinc-200/50 text-xs uppercase tracking-wide dark:border-white/10", secondaryText)}>
                  <tr>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Revenue</th>
                    <th className="px-6 py-3">Orders</th>
                  </tr>
                </thead>
                <tbody>
                  {report.daily.map((day) => (
                    <tr
                      className="border-b border-zinc-200/40 last:border-0 dark:border-white/5"
                      key={day.date}
                    >
                      <td className={cn("px-6 py-4 font-medium", primaryText)}>{day.date}</td>
                      <td className={cn("px-6 py-4 font-semibold text-[#d81b60]")}>
                        {formatMoney(day.revenue)}
                      </td>
                      <td className={cn("px-6 py-4", secondaryText)}>{day.orderCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}
