import io
import zipfile
from typing import Any

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse

from services.newsletter_data import export_csv_data, get_dashboard_data, load_mock_data

app = FastAPI(
    title="POC-53 Newsletter Distribution Economics",
    description="Real Rails Intelligence API — Distribution & Demand",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok", "project": "53-newsletter-distribution-economics"}


@app.get("/api/dashboard")
async def dashboard(
    cohort: str | None = Query(None, description="Filter by cohort quarter"),
    start_month: str | None = Query(None, description="Start month YYYY-MM"),
    end_month: str | None = Query(None, description="End month YYYY-MM"),
    use_live: bool = Query(True, description="Attempt live World Bank fetch"),
) -> dict[str, Any]:
    try:
        data = await get_dashboard_data(
            cohort=cohort,
            start_month=start_month,
            end_month=end_month,
            use_live=use_live,
        )
        return data
    except Exception:
        data = load_mock_data()
        data["meta"]["active_source"] = "synthetic_fallback"
        data["meta"]["api_error"] = True
        return data


@app.get("/api/export")
async def export_data(
    cohort: str | None = Query(None),
    start_month: str | None = Query(None),
    end_month: str | None = Query(None),
) -> StreamingResponse:
    try:
        data = await get_dashboard_data(
            cohort=cohort,
            start_month=start_month,
            end_month=end_month,
            use_live=False,
        )
    except Exception:
        data = load_mock_data()

    csv_files = export_csv_data(data)

    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer, "w", zipfile.ZIP_DEFLATED) as zf:
        for name, csv_content in csv_files.items():
            zf.writestr(f"{name}.csv", csv_content)
        zf.writestr(
            "README.txt",
            "POC-53 Newsletter Distribution Economics — Sample Data Export\n"
            "NOTE: Core newsletter metrics are SYNTHETIC data for demo purposes.\n"
            "World Bank context rows (if present) are live public data.\n",
        )

    buffer.seek(0)
    return StreamingResponse(
        buffer,
        media_type="application/zip",
        headers={"Content-Disposition": "attachment; filename=newsletter_sample_data.zip"},
    )


@app.get("/api/mock")
async def mock_fallback() -> dict[str, Any]:
    data = load_mock_data()
    data["meta"]["active_source"] = "synthetic"
    return data
