import type { DashboardData, FilterState } from "@/types/dashboard";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function buildQuery(filters: Partial<FilterState>): string {
  const params = new URLSearchParams();
  if (filters.cohort && filters.cohort !== "all") {
    params.set("cohort", filters.cohort);
  }
  if (filters.startMonth) params.set("start_month", filters.startMonth);
  if (filters.endMonth) params.set("end_month", filters.endMonth);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

function enrichClientInsights(data: DashboardData): DashboardData {
  const deliverability = data.deliverability;
  const sponsorship = data.sponsorship;
  const cohorts = data.cohorts;
  const referralFlows = data.referral_flows;
  const insights: DashboardData["insights"] = {};

  if (deliverability.length) {
    const latest = deliverability[deliverability.length - 1];
    const openDelta = latest.open_rate - latest.industry_open_rate;
    insights.deliverability = {
      open_rate: latest.open_rate,
      open_rate_insight: `${latest.open_rate.toFixed(1)}% open rate — ${openDelta >= 0 ? "+" : ""}${openDelta.toFixed(1)}pp vs ${latest.industry_open_rate.toFixed(1)}% industry benchmark`,
      bounce_rate_insight: `${latest.bounce_rate.toFixed(1)}% bounce — ${latest.bounce_rate < latest.industry_bounce_rate ? "below" : "above"} industry avg of ${latest.industry_bounce_rate.toFixed(1)}%`,
      spam_rate_insight: `${latest.spam_rate.toFixed(2)}% spam complaints — ${latest.spam_rate <= latest.industry_spam_rate ? "healthy" : "elevated"} vs ${latest.industry_spam_rate.toFixed(2)}% benchmark`,
    };
  }

  if (sponsorship.length) {
    const latest = sponsorship[sponsorship.length - 1];
    const prev = sponsorship[sponsorship.length - 2] ?? latest;
    const revGrowth = ((latest.total_revenue - prev.total_revenue) / prev.total_revenue) * 100;
    insights.sponsorship = {
      cpm: latest.cpm,
      revenue_per_send: latest.revenue_per_send,
      cpm_insight: `$${latest.cpm.toFixed(2)} CPM with ${latest.slots} slots — ${latest.cpm > 30 ? "premium" : "standard"} tier pricing`,
      revenue_insight: `$${latest.revenue_per_send.toFixed(2)}/send — ${revGrowth >= 0 ? "+" : ""}${revGrowth.toFixed(1)}% MoM revenue growth`,
    };
  }

  if (cohorts.length) {
    const latest = cohorts[cohorts.length - 1];
    const recent = cohorts.slice(-6);
    const avgChurn = recent.reduce((s, c) => s + c.churn_rate, 0) / recent.length;
    insights.cohorts = {
      total_subscribers: latest.subscribers,
      churn_rate: latest.churn_rate,
      growth_insight: `${latest.subscribers.toLocaleString()} subscribers — 6-mo avg churn ${avgChurn.toFixed(2)}% (${latest.churn_rate < avgChurn ? "improving" : "stable"})`,
    };
  }

  if (referralFlows.length) {
    const viralTotal = referralFlows
      .filter((f) => f.source.includes("Referral"))
      .reduce((s, f) => s + f.value, 0);
    const totalAcq = referralFlows.reduce((s, f) => s + f.value, 0);
    const viralPct = totalAcq ? (viralTotal / totalAcq) * 100 : 0;
    insights.referral = {
      viral_coefficient: Math.round((viralPct / 100) * 100) / 100,
      referral_insight: `${viralPct.toFixed(1)}% of acquisitions flow through referral loops — ${viralPct > 15 ? "strong" : "moderate"} viral distribution`,
    };
  }

  return { ...data, insights };
}

async function fetchMockFallback(): Promise<DashboardData> {
  const res = await fetch("/mock_data.json");
  if (!res.ok) throw new Error("Mock data unavailable");
  const data = (await res.json()) as DashboardData;
  data.meta.active_source = "synthetic_fallback";
  data.meta.api_error = true;
  return enrichClientInsights(data);
}

export async function fetchDashboard(
  filters: Partial<FilterState> = {}
): Promise<DashboardData> {
  const query = buildQuery(filters);

  try {
    const res = await fetch(`${API_BASE}/api/dashboard${query}`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return (await res.json()) as DashboardData;
  } catch {
    const mock = await fetchMockFallback();
    return applyClientFilters(mock, filters);
  }
}

function applyClientFilters(
  data: DashboardData,
  filters: Partial<FilterState>
): DashboardData {
  const filtered = { ...data };

  if (filters.cohort && filters.cohort !== "all") {
    filtered.cohorts = data.cohorts.filter((c) => c.cohort === filters.cohort);
  }
  if (filters.startMonth) {
    filtered.cohorts = filtered.cohorts.filter(
      (c) => c.month >= filters.startMonth!
    );
    filtered.deliverability = data.deliverability.filter(
      (d) => d.month >= filters.startMonth!
    );
    filtered.sponsorship = data.sponsorship.filter(
      (s) => s.month >= filters.startMonth!
    );
  }
  if (filters.endMonth) {
    filtered.cohorts = filtered.cohorts.filter(
      (c) => c.month <= filters.endMonth!
    );
    filtered.deliverability = filtered.deliverability.filter(
      (d) => d.month <= filters.endMonth!
    );
    filtered.sponsorship = filtered.sponsorship.filter(
      (s) => s.month <= filters.endMonth!
    );
  }

  return enrichClientInsights(filtered);
}

export async function downloadSampleData(
  filters: Partial<FilterState> = {}
): Promise<void> {
  const query = buildQuery(filters);

  try {
    const res = await fetch(`${API_BASE}/api/export${query}`);
    if (!res.ok) throw new Error("Export failed");
    const blob = await res.blob();
    triggerDownload(blob, "newsletter_sample_data.zip");
  } catch {
    const data = await fetchMockFallback();
    const filtered = applyClientFilters(data, filters);
    const csv = buildClientCsv(filtered);
    const blob = new Blob([csv], { type: "text/csv" });
    triggerDownload(blob, "newsletter_sample_data.csv");
  }
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function buildClientCsv(data: DashboardData): string {
  const lines: string[] = [
    "# POC-53 Newsletter Distribution Economics",
    "# NOTE: SYNTHETIC DATA for demo purposes",
    "",
    "## COHORTS",
    "cohort,month,subscribers,new_subscribers,churned,churn_rate,retained",
  ];

  data.cohorts.forEach((c) => {
    lines.push(
      `${c.cohort},${c.month},${c.subscribers},${c.new_subscribers},${c.churned},${c.churn_rate},${c.retained}`
    );
  });

  lines.push("", "## DELIVERABILITY", "month,open_rate,bounce_rate,spam_rate");
  data.deliverability.forEach((d) => {
    lines.push(`${d.month},${d.open_rate},${d.bounce_rate},${d.spam_rate}`);
  });

  lines.push("", "## SPONSORSHIP", "month,cpm,slots,revenue_per_send,total_revenue");
  data.sponsorship.forEach((s) => {
    lines.push(
      `${s.month},${s.cpm},${s.slots},${s.revenue_per_send},${s.total_revenue}`
    );
  });

  return lines.join("\n");
}
