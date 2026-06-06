# Functional UAT Checklist - POC-53

- [x] **Data Handshake**: Clicking cohort segments on the main stage populates subscriber metadata and insight overlays in the sidebar.
- [x] **Filter Integrity**: Selecting date range, cohort, or channel filters updates all charts and metrics instantly without a full page refresh.
- [x] **Referral Loop Visualization**: Sankey diagram correctly maps acquisition flow between channels and subscriber sources.
- [x] **Deliverability Flags**: Open rate, bounce rate, and spam rate render against industry benchmark lines with correct delta indicators.
- [x] **Sponsor Revenue Model**: CPM inputs and send volume sliders update projected revenue figures in real time.
- [x] **Ledger Asset Export**: "Download Sample Data" button compiles all dashboard metrics into an active `.csv` package download.
- [x] **Loading Metrics**: System handles initial data fetch delays gracefully using specialized placeholder skeleton displays.
- [x] **Mock Fallback**: When backend is unreachable, synthetic mock_data.json loads automatically and is labeled clearly in the UI.
- [x] **Sidebar Intelligence**: All five sidebar sections (Title, Why This Matters, Who Controls the Rail, Filters, Download) are populated and readable.
- [x] **Responsiveness**: Dashboard renders correctly at 1440px, 1024px, and 768px breakpoints without layout breakage.
