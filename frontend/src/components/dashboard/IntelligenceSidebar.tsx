"use client";

import type { ReactNode } from "react";
import { Download, HelpCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { downloadSampleData } from "@/lib/api";
import type { DashboardData, FilterState } from "@/types/dashboard";

interface IntelligenceSidebarProps {
  data: DashboardData;
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  isLoading?: boolean;
}

export function IntelligenceSidebar({
  data,
  filters,
  onFilterChange,
  isLoading,
}: IntelligenceSidebarProps) {
  const { sidebar, meta, filters: filterOptions, insights } = data;
  const metric = sidebar.high_level_metric;

  const sourceLabel =
    meta.active_source === "hybrid"
      ? "Hybrid (Live WB + Synthetic)"
      : meta.active_source === "synthetic_fallback"
        ? "Synthetic Fallback"
        : "Synthetic Demo Data";

  return (
    <TooltipProvider>
      <aside className="flex h-full w-full flex-col gap-5 overflow-y-auto border-l border-border-rail bg-surface/50 p-5">
        {/* Section A: Title & High-level Metric */}
        <section>
          <div className="mb-1 flex items-center gap-2">
            <Badge variant="secondary">POC-53</Badge>
            <Badge variant="outline">Distribution & Demand</Badge>
          </div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground">
            {sidebar.title}
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">Real Rails Intelligence Library</p>

          <div className="mt-4 rounded-lg border border-border-rail bg-obsidian/60 p-4">
            <p className="text-xs text-muted-foreground">{metric.label}</p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-cyan-accent">
                {metric.value}
                <span className="text-lg">{metric.unit}</span>
              </span>
              <span className="text-xs text-emerald-400">
                +{metric.delta}{metric.unit} {metric.delta_label}
              </span>
            </div>
          </div>
        </section>

        {/* Section B: Why This Matters */}
        <section className="rounded-lg border border-border-rail p-4">
          <div className="mb-2 flex items-center gap-2">
            <Info className="h-4 w-4 text-cyan-accent" />
            <h2 className="text-sm font-semibold">Why This Matters</h2>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            {sidebar.why_this_matters}
          </p>
        </section>

        {/* Section C: Who Controls the Rail */}
        <section className="rounded-lg border border-border-rail p-4">
          <div className="mb-2 flex items-center gap-2">
            <HelpCircle className="h-4 w-4 text-indigo-accent" />
            <h2 className="text-sm font-semibold">Who Controls the Rail</h2>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            {sidebar.who_controls_the_rail}
          </p>
        </section>

        {/* Live Insights */}
        {insights && (
          <section className="space-y-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Live Insights
            </h2>
            {insights.cohorts?.growth_insight && (
              <InsightPill text={insights.cohorts.growth_insight} />
            )}
            {insights.deliverability?.open_rate_insight && (
              <InsightPill text={insights.deliverability.open_rate_insight} />
            )}
            {insights.referral?.referral_insight && (
              <InsightPill text={insights.referral.referral_insight} />
            )}
            {insights.sponsorship?.revenue_insight && (
              <InsightPill text={insights.sponsorship.revenue_insight} />
            )}
          </section>
        )}

        {/* Section D: Filters */}
        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Filters
          </h2>

          <FilterField
            label="Cohort"
            tooltip="Filter subscriber growth by acquisition quarter"
          >
            <Select
              value={filters.cohort}
              onValueChange={(v) => onFilterChange({ ...filters, cohort: v })}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="All cohorts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cohorts</SelectItem>
                {filterOptions.cohorts.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FilterField>

          <FilterField
            label="Start Month"
            tooltip="Beginning of the date range filter"
          >
            <Select
              value={filters.startMonth}
              onValueChange={(v) => onFilterChange({ ...filters, startMonth: v })}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {getMonthOptions(filterOptions.date_range.start, filterOptions.date_range.end).map(
                  (m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </FilterField>

          <FilterField
            label="End Month"
            tooltip="End of the date range filter"
          >
            <Select
              value={filters.endMonth}
              onValueChange={(v) => onFilterChange({ ...filters, endMonth: v })}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {getMonthOptions(filterOptions.date_range.start, filterOptions.date_range.end).map(
                  (m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </FilterField>
        </section>

        {/* Data Source Badge */}
        <div className="flex flex-wrap gap-2">
          <Badge variant={meta.api_error ? "warning" : "outline"}>{sourceLabel}</Badge>
          <Badge variant="warning">{meta.synthetic_label || meta.label}</Badge>
        </div>

        {/* Section E: Download */}
        <section className="mt-auto">
          <Button
            className="w-full"
            onClick={() => downloadSampleData(filters)}
            disabled={isLoading}
          >
            <Download className="h-4 w-4" />
            Download Sample Data
          </Button>
          <p className="mt-2 text-center text-[10px] text-muted-foreground">
            Exports cohorts, deliverability, sponsorship & referral CSVs
          </p>
        </section>
      </aside>
    </TooltipProvider>
  );
}

function InsightPill({ text }: { text: string }) {
  return (
    <div className="rounded-md border border-cyan-accent/20 bg-cyan-accent/5 px-3 py-2 text-xs text-foreground/90">
      {text}
    </div>
  );
}

function FilterField({
  label,
  tooltip,
  children,
}: {
  label: string;
  tooltip: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <label className="text-xs text-muted-foreground">{label}</label>
        <Tooltip>
          <TooltipTrigger asChild>
            <HelpCircle className="h-3 w-3 cursor-help text-muted-foreground" />
          </TooltipTrigger>
          <TooltipContent side="left">{tooltip}</TooltipContent>
        </Tooltip>
      </div>
      {children}
    </div>
  );
}

function getMonthOptions(start: string, end: string): string[] {
  const months: string[] = [];
  const [sy, sm] = start.split("-").map(Number);
  const [ey, em] = end.split("-").map(Number);
  let y = sy;
  let m = sm;

  while (y < ey || (y === ey && m <= em)) {
    months.push(`${y}-${String(m).padStart(2, "0")}`);
    m++;
    if (m > 12) {
      m = 1;
      y++;
    }
  }
  return months;
}
