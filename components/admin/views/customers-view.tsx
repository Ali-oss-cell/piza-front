"use client";

import { Loader2, Search, User } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { searchHqCustomers, fetchCustomerOrders } from "@/lib/admin-api";
import { dashboardGlass, primaryText, secondaryText } from "@/lib/theme-classes";
import type { HqCustomer } from "@/types/hq";
import type { AdminOrder } from "@/types/admin";
import { cn } from "@/lib/utils";

interface CustomersViewProps {
  token: string;
}

function formatMoney(value: string | number): string {
  return `$${Number(value).toFixed(2)}`;
}

export function CustomersView({ token }: CustomersViewProps): React.ReactElement {
  const [query, setQuery] = useState("");
  const [customers, setCustomers] = useState<HqCustomer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<HqCustomer | null>(null);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (): Promise<void> => {
    if (!query.trim()) {
      return;
    }

    setIsSearching(true);
    setError(null);
    try {
      const data = await searchHqCustomers(token, query.trim());
      setCustomers(data);
      setSelectedCustomer(null);
      setOrders([]);
    } catch (searchError) {
      setError(searchError instanceof Error ? searchError.message : "Search failed.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectCustomer = async (customer: HqCustomer): Promise<void> => {
    setSelectedCustomer(customer);
    setIsLoadingOrders(true);
    setError(null);
    try {
      const data = await fetchCustomerOrders(token, customer.key);
      setOrders(data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load orders.");
    } finally {
      setIsLoadingOrders(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className={cn("font-display text-2xl font-bold", primaryText)}>Customers</h2>
        <p className={cn("mt-1 text-sm", secondaryText)}>
          Search for customers and view their order history
        </p>
      </div>

      <div className={cn("max-w-2xl space-y-4 rounded-2xl border p-6", dashboardGlass)}>
        <div className="flex gap-3">
          <Input
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                void handleSearch();
              }
            }}
            placeholder="Search by name, email, or phone"
            value={query}
          />
          <Button disabled={isSearching || !query.trim()} onClick={() => void handleSearch()}>
            {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </Button>
        </div>
        {error ? <p className="text-sm text-red-500">{error}</p> : null}
      </div>

      {customers.length > 0 ? (
        <section className={cn("overflow-hidden", dashboardGlass)}>
          <div className="border-b border-zinc-200/50 px-6 py-4 dark:border-white/10">
            <h3 className={cn("font-display text-xl font-semibold", primaryText)}>Results</h3>
            <p className={cn("text-sm", secondaryText)}>{customers.length} customer(s) found</p>
          </div>
          <div className="space-y-2 p-4">
            {customers.map((customer) => (
              <button
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl border border-zinc-200/60 bg-white/50 px-4 py-3 text-left transition hover:border-[#d81b60]/50 dark:border-white/10 dark:bg-zinc-900/30",
                  selectedCustomer?.key === customer.key ? "border-[#d81b60] bg-[#d81b60]/5" : ""
                )}
                key={customer.key}
                onClick={() => void handleSelectCustomer(customer)}
                type="button"
              >
                <User className="h-5 w-5 text-[#d81b60]" />
                <div className="min-w-0 flex-1">
                  <p className={cn("font-medium", primaryText)}>{customer.name}</p>
                  <p className={cn("text-xs", secondaryText)}>
                    {customer.email || customer.phone || "No contact"}
                    {" · "}
                    {customer.orderCount} order{customer.orderCount !== 1 ? "s" : ""}
                    {" · "}
                    {customer.brands.join(", ")}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {selectedCustomer ? (
        <section className={cn("overflow-hidden", dashboardGlass)}>
          <div className="border-b border-zinc-200/50 px-6 py-4 dark:border-white/10">
            <h3 className={cn("font-display text-xl font-semibold", primaryText)}>
              Orders for {selectedCustomer.name}
            </h3>
            <p className={cn("text-sm", secondaryText)}>
              {selectedCustomer.orderCount} total order(s)
            </p>
          </div>
          {isLoadingOrders ? (
            <div className="flex min-h-[20vh] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-[#d81b60]" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className={cn("border-b border-zinc-200/50 text-xs uppercase tracking-wide dark:border-white/10", secondaryText)}>
                  <tr>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Items</th>
                    <th className="px-6 py-3">Total</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr>
                      <td className={cn("px-6 py-8 text-center", secondaryText)} colSpan={4}>
                        No orders found.
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => (
                      <tr
                        className="border-b border-zinc-200/40 last:border-0 dark:border-white/5"
                        key={order.id}
                      >
                        <td className={cn("px-6 py-4", secondaryText)}>
                          {new Intl.DateTimeFormat("en-AU", {
                            hour: "2-digit",
                            minute: "2-digit",
                            day: "numeric",
                            month: "short",
                          }).format(new Date(order.createdAt))}
                        </td>
                        <td className={cn("px-6 py-4", secondaryText)}>{order.items.length}</td>
                        <td className={cn("px-6 py-4 font-semibold text-[#d81b60]")}>
                          {formatMoney(order.total)}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={cn(
                              "rounded-full px-2.5 py-0.5 text-xs font-medium",
                              order.status === "COMPLETED"
                                ? "bg-emerald-500/15 text-emerald-600"
                                : "bg-amber-500/15 text-amber-600"
                            )}
                          >
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      ) : null}
    </div>
  );
}
