"use client";

import { Activity, BarChart3, Mail, Radio, TrendingUp, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { DashboardData } from "@/types/dashboard";
import { formatCurrency } from "@/lib/utils";

interface DashboardNavbarProps {
  data: DashboardData;
  activeSection?: string;
  onNavigate?: (section: string) => void;
}

const NAV_ITEMS = [
  { id: "overview", label: "Overview", icon: Activity },
  { id: "cohorts", label: "Cohorts", icon: TrendingUp },
  { id: "referrals", label: "Referrals", icon: Radio },
  { id: "deliverability", label: "Deliverability", icon: Mail },
  { id: "revenue", label: "Revenue", icon: BarChart3 },
] as const;

export function DashboardNavbar({
  data,
  activeSection = "overview",
  onNavigate,
}: DashboardNavbarProps) {
  const latest = data.cohorts[data.cohorts.length - 1];
  const latestRev = data.sponsorship[data.sponsorship.length - 1];
  const source =
    data.meta.active_source === "hybrid"
      ? "LIVE + SYNTHETIC"
      : data.meta.api_error
        ? "MOCK FALLBACK"
        : "SYNTHETIC";

  return (
    <header className="neon-navbar neon-navbar-full sticky top-0 z-30 w-full shrink-0 px-6 py-3">
      <div className="flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="neon-logo-pulse flex h-9 w-9 items-center justify-center rounded-lg">
            <Zap className="h-4 w-4 text-cyan-accent" />
          </div>
          <div>
            <p className="neon-text text-sm font-semibold tracking-tight">
              Newsletter Distribution Economics
            </p>
            <p className="text-[10px] text-muted-foreground">
              POC-53 · Distribution & Demand Rail
            </p>
          </div>
        </div>

        {/* Live ticker */}
        <div className="hidden items-center gap-4 md:flex">
          <TickerStat label="Subs" value={latest?.subscribers.toLocaleString() ?? "—"} />
          <TickerStat
            label="Open"
            value={`${data.deliverability[data.deliverability.length - 1]?.open_rate ?? "—"}%`}
            neon
          />
          <TickerStat
            label="Rev/Send"
            value={latestRev ? formatCurrency(latestRev.revenue_per_send) : "—"}
          />
          <TickerStat
            label="List Health"
            value={`${data.list_health?.domain_reputation ?? "—"}/100`}
          />
        </div>

        <Badge variant={data.meta.api_error ? "warning" : "default"} className="shrink-0">
          {source}
        </Badge>
      </div>

      {/* Nav tabs */}
      <nav className="mt-3 flex gap-1 overflow-x-auto">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const isActive = activeSection === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onNavigate?.(id)}
              className={`neon-nav-item flex items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                isActive ? "neon-nav-active" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          );
        })}
      </nav>
    </header>
  );
}

function TickerStat({
  label,
  value,
  neon,
}: {
  label: string;
  value: string;
  neon?: boolean;
}) {
  return (
    <div className="neon-ticker rounded-md px-3 py-1.5">
      <p className="text-[9px] uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className={`text-sm font-bold ${neon ? "neon-text" : "text-foreground"}`}>
        {value}
      </p>
    </div>
  );
}
