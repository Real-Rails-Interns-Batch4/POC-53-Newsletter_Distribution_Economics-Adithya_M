# POC-53: Newsletter Distribution Economics

A real-time analytics dashboard illustrating how independent newsletter rails operate outside algorithmic gatekeepers. Built with a FastAPI backend and a Next.js (TypeScript/Tailwind CSS) frontend, this project integrates public socioeconomic indices (World Bank API) with core subscriber, deliverability, and sponsorship metrics.

---

## 🚀 Getting Started

### 1. Run the Backend (FastAPI)
Navigate to the `backend` directory, set up your Python environment, install the dependencies, and launch:
```bash
cd backend
# Activate your virtual environment
.venv\Scripts\activate
# Install requirements
pip install -r requirements.txt
# Run the application
python run.py
```
The backend service will be available at **`http://localhost:8000`**.

### 2. Run the Frontend (Next.js)
Navigate to the `frontend` directory, install Node dependencies, and start the development server:
```bash
cd frontend
npm install
npm run dev
```
The frontend application will be running at **`http://localhost:3000`**.

---

## 📁 Project Structure

```text
POC-53-Newsletter_Distribution_Economics/
├── .gitignore              # Files/folders excluded from version control
├── LICENSE                 # Project license (MIT)
├── README.md               # Getting started guide and overview
├── ARCHITECTURE.md         # Detailed architectural documentation
├── backend/                # FastAPI application
│   ├── data/               # Baseline synthetic datasets (mock_data.json)
│   ├── services/           # Data enrichment and API services
│   ├── main.py             # Server endpoints & routing
│   └── run.py              # Server execution script
└── frontend/               # Next.js web application
    ├── src/
    │   ├── app/            # Main layout and CSS globals
    │   ├── components/     # Interactive dashboard blocks & charts
    │   ├── lib/            # API queries and helper functions
    │   └── types/          # TypeScript interface definitions
    └── package.json        # Frontend configuration and scripts
```

---

## 🎨 Technology Stack

### Backend
* **FastAPI**: High-performance Python web framework for endpoints.
* **DuckDB & Pandas**: Data analysis, query processing, and fast CSV exportation.
* **HTTPX**: Non-blocking asynchronous client to query public APIs.

### Frontend
* **Next.js 14**: Modern React web framework with App Router.
* **Tailwind CSS**: Sleek styling with custom Obsidian themes and glassmorphic micro-animations.
* **Recharts**: Responsive chart visualizations for cohort, deliverability, and revenue metrics.
* **Apache ECharts**: Renders interactive Sankey diagrams to map acquisition flows.
