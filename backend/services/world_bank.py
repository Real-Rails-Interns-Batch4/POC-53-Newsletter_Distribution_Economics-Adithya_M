import os
from typing import Any

import httpx
from dotenv import load_dotenv

load_dotenv()

WORLD_BANK_BASE = os.getenv("WORLD_BANK_API_BASE", "https://api.worldbank.org/v2")

INDICATORS = {
    "internet_users_pct": "IT.NET.USER.ZS",
    "gdp_per_capita": "NY.GDP.PCAP.CD",
}


async def fetch_world_bank_indicator(
    indicator_code: str,
    country: str = "US",
    per_page: int = 5,
) -> list[dict[str, Any]]:
    url = f"{WORLD_BANK_BASE}/country/{country}/indicator/{indicator_code}"
    params = {"format": "json", "per_page": per_page, "date": "2020:2024"}

    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(url, params=params)
        response.raise_for_status()
        data = response.json()

    if not isinstance(data, list) or len(data) < 2:
        return []

    records = data[1]
    if not records:
        return []

    results = []
    for row in records:
        value = row.get("value")
        if value is None:
            continue
        try:
            numeric_value = float(value)
        except (TypeError, ValueError):
            continue

        indicator = row.get("indicator", {})
        country_obj = row.get("country", {})
        results.append(
            {
                "indicator": indicator.get("value", indicator_code),
                "country": country_obj.get("value", country),
                "year": int(row["date"]) if row.get("date") else None,
                "value": numeric_value,
                "source": f"World Bank — {indicator_code}",
            }
        )
    return results


async def fetch_world_bank_context() -> tuple[list[dict[str, Any]], str]:
    """Fetch World Bank context data. Returns (data, source_label)."""
    try:
        internet = await fetch_world_bank_indicator(INDICATORS["internet_users_pct"], "US")
        gdp = await fetch_world_bank_indicator(INDICATORS["gdp_per_capita"], "US")

        combined = internet[:2] + gdp[:1]
        if combined:
            return combined, "live"
        return [], "empty"
    except Exception:
        return [], "error"
