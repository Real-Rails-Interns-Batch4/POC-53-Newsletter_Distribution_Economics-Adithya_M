import csv
import io
import json
import os
from pathlib import Path
from typing import Any

from dotenv import load_dotenv

from services.world_bank import fetch_world_bank_context

load_dotenv()

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
MOCK_DATA_PATH = Path(os.getenv("MOCK_DATA_PATH", DATA_DIR / "mock_data.json"))


def load_mock_data() -> dict[str, Any]:
    with open(MOCK_DATA_PATH, encoding="utf-8") as f:
        return json.load(f)


def enrich_insights(data: dict[str, Any]) -> dict[str, Any]:
    """Transform raw data points into contextual insights."""
    deliverability = data.get("deliverability", [])
    sponsorship = data.get("sponsorship", [])
    cohorts = data.get("cohorts", [])

    insights: dict[str, Any] = {}

    if deliverability:
        latest = deliverability[-1]
        open_delta = latest["open_rate"] - latest["industry_open_rate"]
        insights["deliverability"] = {
            "open_rate": latest["open_rate"],
            "open_rate_insight": (
                f"{latest['open_rate']:.1f}% open rate — "
                f"{open_delta:+.1f}pp vs {latest['industry_open_rate']:.1f}% industry benchmark"
            ),
            "bounce_rate_insight": (
                f"{latest['bounce_rate']:.1f}% bounce — "
                f"{'below' if latest['bounce_rate'] < latest['industry_bounce_rate'] else 'above'} "
                f"industry avg of {latest['industry_bounce_rate']:.1f}%"
            ),
            "spam_rate_insight": (
                f"{latest['spam_rate']:.2f}% spam complaints — "
                f"{'healthy' if latest['spam_rate'] <= latest['industry_spam_rate'] else 'elevated'} "
                f"vs {latest['industry_spam_rate']:.2f}% benchmark"
            ),
        }

    if sponsorship:
        latest_rev = sponsorship[-1]
        prev_rev = sponsorship[-2] if len(sponsorship) > 1 else latest_rev
        rev_growth = (
            (latest_rev["total_revenue"] - prev_rev["total_revenue"])
            / prev_rev["total_revenue"]
            * 100
        )
        insights["sponsorship"] = {
            "cpm": latest_rev["cpm"],
            "revenue_per_send": latest_rev["revenue_per_send"],
            "cpm_insight": (
                f"${latest_rev['cpm']:.2f} CPM with {latest_rev['slots']} slots — "
                f"{'premium' if latest_rev['cpm'] > 30 else 'standard'} tier pricing"
            ),
            "revenue_insight": (
                f"${latest_rev['revenue_per_send']:.2f}/send — "
                f"{rev_growth:+.1f}% MoM revenue growth"
            ),
        }

    if cohorts:
        latest_cohort = cohorts[-1]
        total_subs = latest_cohort["subscribers"]
        avg_churn = sum(c["churn_rate"] for c in cohorts[-6:]) / min(6, len(cohorts))
        insights["cohorts"] = {
            "total_subscribers": total_subs,
            "churn_rate": latest_cohort["churn_rate"],
            "growth_insight": (
                f"{total_subs:,} subscribers — "
                f"6-mo avg churn {avg_churn:.2f}% "
                f"({'improving' if latest_cohort['churn_rate'] < avg_churn else 'stable'})"
            ),
        }

    referral_flows = data.get("referral_flows", [])
    if referral_flows:
        viral_total = sum(
            f["value"] for f in referral_flows if "Referral" in f.get("source", "")
        )
        total_acq = sum(f["value"] for f in referral_flows)
        viral_pct = (viral_total / total_acq * 100) if total_acq else 0
        insights["referral"] = {
            "viral_coefficient": round(viral_pct / 100, 2),
            "referral_insight": (
                f"{viral_pct:.1f}% of acquisitions flow through referral loops — "
                f"{'strong' if viral_pct > 15 else 'moderate'} viral distribution"
            ),
        }

    data["insights"] = insights
    return data


def filter_data(
    data: dict[str, Any],
    cohort: str | None = None,
    start_month: str | None = None,
    end_month: str | None = None,
) -> dict[str, Any]:
    filtered = data.copy()

    if cohort:
        filtered["cohorts"] = [c for c in data["cohorts"] if c["cohort"] == cohort]
    monthly_keys = ("cohorts", "deliverability", "sponsorship", "engagement_metrics")
    if start_month:
        for key in monthly_keys:
            if key in filtered:
                filtered[key] = [r for r in filtered[key] if r.get("month", "") >= start_month]
    if end_month:
        for key in monthly_keys:
            if key in filtered:
                filtered[key] = [r for r in filtered[key] if r.get("month", "") <= end_month]

    return enrich_insights(filtered)


def export_csv_data(data: dict[str, Any]) -> dict[str, str]:
    """Generate CSV strings for all datasets."""
    exports: dict[str, str] = {}
    datasets = {
        "cohorts": data.get("cohorts", []),
        "deliverability": data.get("deliverability", []),
        "sponsorship": data.get("sponsorship", []),
        "engagement_metrics": data.get("engagement_metrics", []),
        "esp_economics": data.get("esp_economics", []),
        "distribution_channels": data.get("distribution_channels", []),
        "referral_flows": data.get("referral_flows", []),
    }

    for name, records in datasets.items():
        if records:
            exports[name] = _records_to_csv(records)

    return exports


def _records_to_csv(records: list[dict[str, Any]]) -> str:
    buffer = io.StringIO()
    writer = csv.DictWriter(buffer, fieldnames=records[0].keys())
    writer.writeheader()
    writer.writerows(records)
    return buffer.getvalue()


async def get_dashboard_data(
    cohort: str | None = None,
    start_month: str | None = None,
    end_month: str | None = None,
    use_live: bool = True,
) -> dict[str, Any]:
    data = load_mock_data()
    source = "synthetic"

    if use_live:
        wb_data, wb_status = await fetch_world_bank_context()
        if wb_status == "live" and wb_data:
            data["world_bank_context"] = wb_data
            source = "hybrid"
        else:
            data["world_bank_fallback"] = True

    data["meta"]["active_source"] = source
    data["meta"]["synthetic_label"] = data["meta"]["label"]

    filtered = filter_data(data, cohort=cohort, start_month=start_month, end_month=end_month)
    return filtered
