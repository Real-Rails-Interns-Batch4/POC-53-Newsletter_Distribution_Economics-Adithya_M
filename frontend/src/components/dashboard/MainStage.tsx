"use client";

import dynamic from "next/dynamic";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CohortChart } from "@/components/charts/CohortChart";
import { DeliverabilityChart } from "@/components/charts/DeliverabilityChart";
import { SponsorshipChart } from "@/components/charts/SponsorshipChart";
import type { DashboardData } from "@/types/dashboard";
import { formatCurrency } from "@/lib/utils";

const ReferralChart = dynamic(
  () => import("@/components/charts/ReferralChart").then((m) => m.ReferralChart),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[320px] items-center justify-center text-sm text-muted-foreground">
        Loading referral chart…
      </div>
    ),
  }
);

interface MainStageProps {
  data: DashboardData;
}

export function MainStage({ data }: MainStageProps) {
  const latestDeliverability = data.deliverability[data.deliverability.length - 1];
  const latestSponsorship = data.sponsorship[data.sponsorship.length - 1];
  const latestCohort = data.cohorts[data.cohorts.length - 1];

  return (
    <main className="flex h-full flex-col gap-4 overflow-y-auto p-5">
      {/* KPI Strip */}
      <div id="overview" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard
          label="Total Subscribers"
          value={latestCohort?.subscribers.toLocaleString() ?? "—"}
          sub={data.insights?.cohorts?.growth_insight}
        />
        <KpiCard
          label="Open Rate"
          value={`${latestDeliverability?.open_rate ?? "—"}%`}
          sub={data.insights?.deliverability?.open_rate_insight}
          accent
        />
        <KpiCard
          label="Viral Coefficient"
          value={data.insights?.referral?.viral_coefficient?.toFixed(2) ?? "—"}
          sub={data.insights?.referral?.referral_insight}
        />
        <KpiCard
          label="Revenue / Send"
          value={latestSponsorship ? formatCurrency(latestSponsorship.revenue_per_send) : "—"}
          sub={data.insights?.sponsorship?.revenue_insight}
        />
      </div>

      {/* Cohort Dashboard */}
      <Card id="cohorts">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Cohort Dashboard</CardTitle>
              <CardDescription>
                Subscriber growth by cohort with churn overlay — synthetic demo data
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <CohortChart data={data.cohorts} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {/* Referral Loop */}
        <Card id="referrals">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Referral Loop Visualizer</CardTitle>
                <CardDescription>
                  How subscribers acquire other subscribers
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ReferralChart flows={data.referral_flows} />
          </CardContent>
        </Card>

        {/* Deliverability */}
        <Card id="deliverability">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Deliverability Flags</CardTitle>
                <CardDescription>
                  Open, bounce & spam rates vs industry benchmarks
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <DeliverabilityChart data={data.deliverability} />
            {latestDeliverability && (
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <FlagBadge
                  label="Open"
                  value={`${latestDeliverability.open_rate}%`}
                  status={
                    latestDeliverability.open_rate >= latestDeliverability.industry_open_rate
                      ? "good"
                      : "warn"
                  }
                />
                <FlagBadge
                  label="Bounce"
                  value={`${latestDeliverability.bounce_rate}%`}
                  status={
                    latestDeliverability.bounce_rate <= latestDeliverability.industry_bounce_rate
                      ? "good"
                      : "warn"
                  }
                />
                <FlagBadge
                  label="Spam"
                  value={`${latestDeliverability.spam_rate}%`}
                  status={
                    latestDeliverability.spam_rate <= latestDeliverability.industry_spam_rate
                      ? "good"
                      : "warn"
                  }
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sponsor Revenue */}
      <Card id="revenue">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Sponsor Revenue Model</CardTitle>
              <CardDescription>
                CPM pricing, sponsorship slots & revenue per send
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <SponsorshipChart data={data.sponsorship} />
        </CardContent>
      </Card>

      {/* World Bank Context */}
      {data.world_bank_context.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>World Bank Context</CardTitle>
            <CardDescription>
              Live public data — internet penetration & economic indicators
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {data.world_bank_context.map((row, i) => (
                <div
                  key={i}
                  className="rounded-md border border-border-rail bg-obsidian/40 p-3"
                >
                  <p className="text-[10px] text-muted-foreground">{row.indicator}</p>
                  <p className="mt-1 text-lg font-semibold text-cyan-accent">
                    {row.value.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                    {row.indicator.includes("%") ? "%" : ""}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {row.country} · {row.year}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </main>
  );
}

function KpiCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div className="glass-card rounded-lg p-4">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={`mt-1 text-xl font-bold ${accent ? "text-cyan-accent" : "text-foreground"}`}>
        {value}
      </p>
      {sub && <p className="mt-1 line-clamp-2 text-[10px] text-muted-foreground">{sub}</p>}
    </div>
  );
}

function FlagBadge({
  label,
  value,
  status,
}: {
  label: string;
  value: string;
  status: "good" | "warn";
}) {
  return (
    <div
      className={`rounded-md border px-2 py-1.5 text-xs ${
        status === "good"
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
          : "border-amber-500/30 bg-amber-500/10 text-amber-400"
      }`}
    >
      <span className="text-muted-foreground">{label}: </span>
      {value}
    </div>
  );
}
