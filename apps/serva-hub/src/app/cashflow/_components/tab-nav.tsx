"use client";

import { cn } from "@serva/serva-ui";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

const tabs = [
  { label: "Monthly Details", href: "/cashflow/monthly" },
  { label: "Year Summary", href: "/cashflow/yearly" },
] as const;

export function TabNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Build URL preserving year param (and month for monthly view)
  const buildHref = (baseHref: string) => {
    const params = new URLSearchParams();
    const year = searchParams.get("year");
    const month = searchParams.get("month");

    if (year) params.set("year", year);
    // Only preserve month param for monthly view
    if (month && baseHref.includes("/monthly")) {
      params.set("month", month);
    }

    const queryString = params.toString();
    return queryString ? `${baseHref}?${queryString}` : baseHref;
  };

  return (
    <nav className="bg-background inline-flex items-center justify-center rounded-full p-1">
      {tabs.map((tab) => {
        const isActive = pathname.startsWith(tab.href);

        return (
          <Link
            key={tab.href}
            href={buildHref(tab.href)}
            className={cn(
              "inline-flex items-center justify-center rounded-xl px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-all",
              "ring-offset-background focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
              isActive
                ? "text-primary-foreground bg-primary"
                : "text-foreground hover:text-primary",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
