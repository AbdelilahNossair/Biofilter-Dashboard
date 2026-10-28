# Biofilter Dashboard

A Next.js and TypeScript dashboard for exploring recorded biofiltration sensor data. It replays a CSV time series and visualizes head loss, flow rate, pH, temperature, turbidity, and an existing anomaly score.

**Scope:** this is a dataset-playback application. The server reads a committed CSV; it does not connect to live sensors or train an anomaly-detection model.

## Features

- Playback with pause, a position slider, and 0.5×, 1×, 2×, and 5× speeds.
- Dashboard KPIs with recent-history sparklines.
- Head-loss trends, distribution, and threshold-breach counts.
- Sensor views for pH, temperature, and inlet/outlet turbidity.
- Notifications when anomaly score crosses upward through 0.5.
- In-memory alert history with jump-to-step, clear, and CSV export.

## Stack and setup

The manifest specifies Next.js 14.2.5, React 18, TypeScript, Recharts, and Tailwind CSS. Use a Node.js/npm environment compatible with those versions.

```bash
git clone https://github.com/AbdelilahNossair/Biofilter-Dashboard.git
cd Biofilter-Dashboard
npm install
npm run dev
```

Open the URL printed by Next.js, normally `http://localhost:3000`.

```bash
npm run build
npm start
```

The build/start workflow needs a Node server: `/api/data` reads from the filesystem. A static-file-only deployment is insufficient without changing the data-loading approach.

## Data contract

Place the dataset at `public/harmonized_data.csv`. The API reads the first line as column names and parses each following field as a number.

| Column | UI interpretation |
| --- | --- |
| `Time_Step` | Recorded sample identifier |
| `Temperature` | Temperature, displayed in °C |
| `Turbidity_In`, `Turbidity_Out` | Turbidity, displayed in NTU |
| `pH` | Acidity/alkalinity value |
| `Flow_Rate` | Flow, displayed in L/min |
| `Head_Loss` | Head loss, displayed in m |
| `Anomaly_Score` | Precomputed score used for health and alerts |

Use comma-separated numeric fields without quoted commas. The parser is a simple string split rather than a full CSV library. Blank, malformed, or missing values can become `NaN`.

## How the application works

1. `app/api/data/route.ts` reads the entire CSV and returns numeric objects.
2. `app/page.tsx` fetches `/api/data` once and stores the data in browser state.
3. Playback advances the current row. Charts use a recent window of up to 501 rows.
4. An upward crossing from score ≤0.5 to >0.5 adds an alert and a toast.
5. Export downloads `biofilter_alerts.csv` from the current browser session.

Health is calculated as `(1 - Anomaly_Score) * 100`. Head-loss warnings use >1.5; sensor badges have their own thresholds in `app/page.tsx`. These are application rules, not an independently validated maintenance standard.

## Code map

| Path | Responsibility |
| --- | --- |
| `app/page.tsx` | Navigation, playback, thresholds, alert state, export |
| `app/api/data/route.ts` | Filesystem-backed JSON endpoint |
| `components/` | Charts, gauges, KPI cards, and warning UI |
| `app/globals.css` | Main styling |
| `public/harmonized_data.csv` | Bundled playback data |

## Checks and troubleshooting

After starting, inspect `/api/data`, play several rows, drag the slider, visit each view, and export an alert log. If the screen remains on “Loading data…”, check the server output and CSV path; the page does not provide robust fetch-error recovery.

Alert history resets on refresh. Scrubbing across the threshold can add playback events, and alert timestamps reflect the browser's detection time rather than an original sensor timestamp. Some summaries use the full dataset, including rows beyond the current playback position.

No authentication, persistent alert database, live ingestion, test script, or standalone license file is included.
