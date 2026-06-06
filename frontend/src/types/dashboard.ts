export interface DashboardMeta {
  source: string;
  label: string;
  project_id: string;
  project_title: string;
  generated_at: string;
  active_source?: string;
  synthetic_label?: string;
  api_error?: boolean;
  world_bank_fallback?: boolean;
}

export interface HighLevelMetric {
  value: number;
  unit: string;
  label: string;
  delta: number;
  delta_label: string;
}

export interface SidebarData {
  title: string;
  high_level_metric: HighLevelMetric;
  why_this_matters: string;
  who_controls_the_rail: string;
}

export interface CohortRow {
  cohort: string;
  month: string;
  subscribers: number;
  new_subscribers: number;
  churned: number;
  churn_rate: number;
  retained: number;
}

export interface ReferralFlow {
  source: string;
  target: string;
  value: number;
}

export interface ReferralNode {
  id: string;
  category: string;
}

export interface DeliverabilityRow {
  month: string;
  open_rate: number;
  bounce_rate: number;
  spam_rate: number;
  industry_open_rate: number;
  industry_bounce_rate: number;
  industry_spam_rate: number;
}

export interface SponsorshipRow {
  month: string;
  cpm: number;
  slots: number;
  sends: number;
  subscribers: number;
  revenue_per_send: number;
  total_revenue: number;
}

export interface WorldBankRow {
  indicator: string;
  country: string;
  year: number;
  value: number;
  source: string;
}

export interface DashboardInsights {
  deliverability?: {
    open_rate: number;
    open_rate_insight: string;
    bounce_rate_insight: string;
    spam_rate_insight: string;
  };
  sponsorship?: {
    cpm: number;
    revenue_per_send: number;
    cpm_insight: string;
    revenue_insight: string;
  };
  cohorts?: {
    total_subscribers: number;
    churn_rate: number;
    growth_insight: string;
  };
  referral?: {
    viral_coefficient: number;
    referral_insight: string;
  };
}

export interface DashboardFilters {
  cohorts: string[];
  date_range: { start: string; end: string };
  metrics: string[];
}

export interface DashboardData {
  meta: DashboardMeta;
  sidebar: SidebarData;
  cohorts: CohortRow[];
  referral_flows: ReferralFlow[];
  referral_nodes: ReferralNode[];
  deliverability: DeliverabilityRow[];
  sponsorship: SponsorshipRow[];
  world_bank_context: WorldBankRow[];
  filters: DashboardFilters;
  insights: DashboardInsights;
}

export interface FilterState {
  cohort: string;
  startMonth: string;
  endMonth: string;
}
