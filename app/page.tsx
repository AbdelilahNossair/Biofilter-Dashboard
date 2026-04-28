"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import KpiCard from "@/components/KpiCard";
import HeadLossChart from "@/components/HeadLossChart";
import AnomalyChart from "@/components/AnomalyChart";
import PhGauge from "@/components/PhGauge";
import TurbidityPanel from "@/components/TurbidityPanel";
import TempGauge from "@/components/TempGauge";

interface Row {
  Time_Step: number;
  Temperature: number;
  Turbidity_In: number;
  Turbidity_Out: number;
  pH: number;
  Flow_Rate: number;
  Head_Loss: number;
  Anomaly_Score: number;
  [k: string]: number;
}

type Page = "dashboard" | "headloss" | "sensors" | "alerts";

interface WarnEntry {
  step: number;
  score: number;
  time: string;
  ph: number;
  temperature: number;
  turbIn: number;
  turbOut: number;
  flowRate: number;
  headLoss: number;
}

interface ToastEntry {
  id: number;
  step: number;
  score: number;
  time: string;
  exiting: boolean;
}

export default function Dashboard() {
  const [data, setData] = useState<Row[]>([]);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(100);
  const [collapsed, setCollapsed] = useState(false);
  const [page, setPage] = useState<Page>("dashboard");
  const [warningLog, setWarningLog] = useState<WarnEntry[]>([]);
  const [toasts, setToasts] = useState<ToastEntry[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const prevScoreRef = useRef<number>(0);
  const toastIdRef = useRef(0);

  useEffect(() => {
    fetch("/api/data")
      .then((r) => r.json())
      .then((d: Row[]) => setData(d));
  }, []);

  // Warning threshold crossing detection
  useEffect(() => {
    if (data.length === 0) return;
    const score = data[step]?.Anomaly_Score ?? 0;
    if (prevScoreRef.current <= 0.5 && score > 0.5) {
      const now = new Date().toLocaleTimeString();
      const row = data[step];
      setWarningLog((log) => [{
        step, score, time: now,
        ph: row.pH,
        temperature: row.Temperature,
        turbIn: row.Turbidity_In,
        turbOut: row.Turbidity_Out,
        flowRate: row.Flow_Rate,
        headLoss: row.Head_Loss,
      }, ...log]);
      const id = ++toastIdRef.current;
      setToasts((t) => [...t, { id, step, score, time: now, exiting: false }]);
      setTimeout(() => {
        setToasts((t) => t.map((x) => x.id === id ? { ...x, exiting: true } : x));
        setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 300);
      }, 5000);
    }
    prevScoreRef.current = score;
  }, [step, data]);

  const dismissToast = (id: number) => {
    setToasts((t) => t.map((x) => x.id === id ? { ...x, exiting: true } : x));
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 300);
  };

  const startPlayback = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setPlaying(true);
    intervalRef.current = setInterval(() => {
      setStep((prev) => {
        if (prev >= data.length - 1) {
          clearInterval(intervalRef.current!);
          setPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, speed);
  }, [data.length, speed]);

  const stopPlayback = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setPlaying(false);
  }, []);

  useEffect(() => {
    if (playing) startPlayback();
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [speed, playing, startPlayback]);

  if (data.length === 0) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", color: "var(--warm-400)", fontSize: 16, fontWeight: 600 }}>
        Loading data…
      </div>
    );
  }

  const current = data[step];
  const health = (1 - current.Anomaly_Score) * 100;
  const windowData = data.slice(Math.max(0, step - 500), step + 1);
  const sparkWindow = data.slice(Math.max(0, step - 39), step + 1);

  const speeds = [
    { label: "0.5×", val: 200 },
    { label: "1×",   val: 100 },
    { label: "2×",   val: 50  },
    { label: "5×",   val: 20  },
  ];

  return (
    <div className="layout">

      {/* =================== SIDEBAR =================== */}
      <aside className={`sidebar${collapsed ? " collapsed" : ""}`}>
        <div className="sb-logo">
          <div className="sb-logo-icon">BF</div>
          <div className="sb-logo-text">BioFilter</div>
          <button className="sb-toggle" onClick={() => setCollapsed((c) => !c)} title={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
        </div>

        <div className="sb-section">
          <div className="sb-label">Monitor</div>
          <nav className="sb-nav">
            <button className={`sb-item${page === "dashboard" ? " active" : ""}`} onClick={() => setPage("dashboard")}>
              <span className="sb-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                  <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
                </svg>
              </span>
              <span className="sb-item-label">Dashboard</span>
            </button>
            <button className={`sb-item${page === "headloss" ? " active" : ""}`} onClick={() => setPage("headloss")}>
              <span className="sb-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
                </svg>
              </span>
              <span className="sb-item-label">Head Loss</span>
            </button>
            <button className={`sb-item${page === "sensors" ? " active" : ""}`} onClick={() => setPage("sensors")}>
              <span className="sb-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
                </svg>
              </span>
              <span className="sb-item-label">Sensors</span>
            </button>
            <button className={`sb-item${page === "alerts" ? " active" : ""}`} onClick={() => setPage("alerts")}>
              <span className="sb-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
              </span>
              <span className="sb-item-label">Alerts</span>
              {warningLog.length > 0 && <span className="sb-badge">{warningLog.length}</span>}
            </button>
          </nav>
        </div>

        <div className="sb-spacer" />
      </aside>

      {/* =================== MAIN =================== */}
      <div className={`main${collapsed ? " sidebar-collapsed" : ""}`}>

        {/* TOPBAR */}
        <div className="topbar">
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--warm-600)" }}>Playback</div>
            <div style={{ fontSize: 11, fontWeight: 500, color: "var(--warm-400)" }}>
              Step {step + 1} / {data.length}
            </div>
          </div>
          <div className="speed-group">
            {speeds.map((s) => (
              <button
                key={s.label}
                className={`speed-btn${speed === s.val ? " active" : ""}`}
                onClick={() => setSpeed(s.val)}
              >
                {s.label}
              </button>
            ))}
          </div>
          <button
            className={`btn-primary${playing ? " warning" : ""}`}
            onClick={() => (playing ? stopPlayback() : startPlayback())}
          >
            {playing ? "⏸ Pause" : "▶ Play"}
          </button>
          <div className="topbar-spacer" />
          <div className="topbar-user">
            <div className="topbar-avatar">MA</div>
            <div>
              <div className="topbar-uname">Mohamed Taha Alaoui El Ismaili</div>
              <div className="topbar-uemail">Engineer</div>
            </div>
          </div>
        </div>

        {/* SLIDER STRIP */}
        <div className="slider-strip">
          <input
            type="range"
            className="step-slider"
            min={0}
            max={data.length - 1}
            value={step}
            onChange={(e) => setStep(Number(e.target.value))}
          />
        </div>

        {/* CONTENT */}
        <div className="content">

          {/* ===== DASHBOARD PAGE ===== */}
          {page === "dashboard" && (
            <>
              <div className="page-header">
                <div>
                  <div className="page-title">Predictive Maintenance</div>
                  <div className="page-sub">
                    Real-time biofiltration system monitoring · Time step {step + 1} of {data.length}
                  </div>
                </div>
              </div>

              <div className="stats-row" style={{ marginBottom: 20 }}>
                <KpiCard
                  label="System Health"
                  value={health.toFixed(0)}
                  unit="%"
                  status={health < 50 ? "Warning" : "Normal"}
                  sparkData={sparkWindow.map((d) => (1 - d.Anomaly_Score) * 100)}
                  color="#7a233f"
                  variant="green"
                />
                <KpiCard
                  label="Head Loss"
                  value={current.Head_Loss.toFixed(2)}
                  unit="m"
                  status={current.Head_Loss > 1.5 ? "Warning" : "Normal"}
                  sparkData={sparkWindow.map((d) => d.Head_Loss)}
                  color="#1f1f24"
                />
                <KpiCard
                  label="Flow Rate"
                  value={current.Flow_Rate.toFixed(1)}
                  unit="L/min"
                  status="Normal"
                  sparkData={sparkWindow.map((d) => d.Flow_Rate)}
                  color="#4b1829"
                />
                <KpiCard
                  label="Anomaly Score"
                  value={current.Anomaly_Score.toFixed(2)}
                  unit=""
                  status={current.Anomaly_Score > 0.5 ? "Warning" : "Normal"}
                  sparkData={sparkWindow.map((d) => d.Anomaly_Score)}
                  color="#f59e0b"
                />
              </div>

              <div className="g73" style={{ marginBottom: 20 }}>
                <HeadLossChart data={windowData} />
                <AnomalyChart data={windowData} />
              </div>

              <div className="g3">
                <PhGauge value={current.pH} />
                <TurbidityPanel turbIn={current.Turbidity_In} turbOut={current.Turbidity_Out} />
                <TempGauge value={current.Temperature} />
              </div>
            </>
          )}

          {/* ===== HEAD LOSS PAGE ===== */}
          {page === "headloss" && (
            <>
              <div className="page-header">
                <div>
                  <div className="page-title">Head Loss Analysis</div>
                  <div className="page-sub">Filter clogging pressure metrics · Step {step + 1}</div>
                </div>
              </div>

              <div className="stats-row" style={{ marginBottom: 20 }}>
                {[
                  { label: "Current Head Loss", value: current.Head_Loss.toFixed(3), unit: "m", warn: current.Head_Loss > 1.5 },
                  { label: "Max Head Loss", value: Math.max(...data.map((d) => d.Head_Loss)).toFixed(3), unit: "m", warn: false },
                  { label: "Avg Head Loss", value: (data.reduce((s, d) => s + d.Head_Loss, 0) / data.length).toFixed(3), unit: "m", warn: false },
                  { label: "Threshold Breaches", value: String(data.filter((d) => d.Head_Loss > 1.5).length), unit: "", warn: data.filter((d) => d.Head_Loss > 1.5).length > 0 },
                ].map((k) => (
                  <div key={k.label} className={`stat${k.warn ? "" : " stat-green"}`}>
                    <div className="stat-label">{k.label}</div>
                    <div className="stat-val">{k.value}<span style={{ fontSize: 13, marginLeft: 4, opacity: 0.7 }}>{k.unit}</span></div>
                    <div className={`stat-badge${k.warn ? " warn" : ""}`}>{k.warn ? "Warning" : "Normal"}</div>
                  </div>
                ))}
              </div>

              <div style={{ height: 340, marginBottom: 20 }}>
                <HeadLossChart data={windowData} />
              </div>

              <div className="g2">
                <div className="card">
                  <div className="card-header">
                    <div>
                      <div className="card-title">Flow Rate vs Head Loss</div>
                      <div className="card-sub">Correlation over current window</div>
                    </div>
                  </div>
                  <div style={{ padding: "12px 0 0" }}>
                    {windowData.slice(-10).map((d, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                        <span style={{ fontSize: 11, color: "var(--warm-400)", width: 56, flexShrink: 0 }}>Step {d.Time_Step}</span>
                        <div className="pbar-wrap" style={{ flex: 1 }}>
                          <div className="pbar-fill" style={{ width: `${(d.Head_Loss / 3) * 100}%`, background: d.Head_Loss > 1.5 ? "var(--amber-500)" : "var(--green-600)" }} />
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 600, color: "var(--warm-700)", width: 48, textAlign: "right" }}>{d.Head_Loss.toFixed(2)} m</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="card">
                  <div className="card-header">
                    <div>
                      <div className="card-title">Head Loss Distribution</div>
                      <div className="card-sub">Bucketed across all data</div>
                    </div>
                  </div>
                  <div style={{ padding: "12px 0 0" }}>
                    {[
                      { label: "0 – 0.5 m", max: 0.5 },
                      { label: "0.5 – 1.0 m", max: 1.0 },
                      { label: "1.0 – 1.5 m", max: 1.5 },
                      { label: "1.5 – 2.0 m", max: 2.0 },
                      { label: "> 2.0 m", max: Infinity },
                    ].map((b, i, arr) => {
                      const count = data.filter((d) => d.Head_Loss < b.max && d.Head_Loss >= (arr[i - 1]?.max ?? 0)).length;
                      const pct = (count / data.length) * 100;
                      return (
                        <div key={b.label} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                          <span style={{ fontSize: 11, color: "var(--warm-400)", width: 80, flexShrink: 0 }}>{b.label}</span>
                          <div className="pbar-wrap" style={{ flex: 1 }}>
                            <div className="pbar-fill" style={{ width: `${pct}%`, background: b.max > 1.5 ? "var(--amber-500)" : "var(--green-600)" }} />
                          </div>
                          <span style={{ fontSize: 11, fontWeight: 600, color: "var(--warm-700)", width: 36, textAlign: "right" }}>{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ===== SENSORS PAGE ===== */}
          {page === "sensors" && (
            <>
              <div className="page-header">
                <div>
                  <div className="page-title">Sensor Readings</div>
                  <div className="page-sub">pH, temperature and turbidity monitoring · Step {step + 1}</div>
                </div>
              </div>

              <div className="stats-row" style={{ marginBottom: 20 }}>
                {[
                  { label: "pH", value: current.pH.toFixed(2), unit: "", warn: current.pH < 6.5 || current.pH > 8.5 },
                  { label: "Temperature", value: current.Temperature.toFixed(1), unit: "°C", warn: current.Temperature > 35 },
                  { label: "Turbidity In", value: current.Turbidity_In.toFixed(2), unit: "NTU", warn: current.Turbidity_In > 50 },
                  { label: "Turbidity Out", value: current.Turbidity_Out.toFixed(2), unit: "NTU", warn: current.Turbidity_Out > 5 },
                ].map((k) => (
                  <div key={k.label} className={`stat${k.warn ? "" : " stat-green"}`}>
                    <div className="stat-label">{k.label}</div>
                    <div className="stat-val">{k.value}<span style={{ fontSize: 13, marginLeft: 4, opacity: 0.7 }}>{k.unit}</span></div>
                    <div className={`stat-badge${k.warn ? " warn" : ""}`}>{k.warn ? "Warning" : "Normal"}</div>
                  </div>
                ))}
              </div>

              <div className="g3" style={{ marginBottom: 20 }}>
                <PhGauge value={current.pH} />
                <TempGauge value={current.Temperature} />
                <TurbidityPanel turbIn={current.Turbidity_In} turbOut={current.Turbidity_Out} />
              </div>

              <div className="g2">
                <div className="card">
                  <div className="card-header">
                    <div>
                      <div className="card-title">pH Trend</div>
                      <div className="card-sub">Last 10 readings</div>
                    </div>
                  </div>
                  <div style={{ padding: "12px 0 0" }}>
                    {windowData.slice(-10).map((d, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                        <span style={{ fontSize: 11, color: "var(--warm-400)", width: 56, flexShrink: 0 }}>Step {d.Time_Step}</span>
                        <div className="pbar-wrap" style={{ flex: 1 }}>
                          <div className="pbar-fill" style={{ width: `${(d.pH / 14) * 100}%`, background: (d.pH < 6.5 || d.pH > 8.5) ? "var(--amber-500)" : "var(--green-600)" }} />
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 600, color: "var(--warm-700)", width: 36, textAlign: "right" }}>{d.pH.toFixed(1)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="card">
                  <div className="card-header">
                    <div>
                      <div className="card-title">Temperature Trend</div>
                      <div className="card-sub">Last 10 readings</div>
                    </div>
                  </div>
                  <div style={{ padding: "12px 0 0" }}>
                    {windowData.slice(-10).map((d, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                        <span style={{ fontSize: 11, color: "var(--warm-400)", width: 56, flexShrink: 0 }}>Step {d.Time_Step}</span>
                        <div className="pbar-wrap" style={{ flex: 1 }}>
                          <div className="pbar-fill" style={{ width: `${(d.Temperature / 50) * 100}%`, background: d.Temperature > 35 ? "var(--amber-500)" : "var(--green-600)" }} />
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 600, color: "var(--warm-700)", width: 48, textAlign: "right" }}>{d.Temperature.toFixed(1)} °C</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ===== ALERTS PAGE ===== */}
          {page === "alerts" && (
            <>
              <div className="page-header">
                <div>
                  <div className="page-title">Alert History</div>
                  <div className="page-sub">Anomaly threshold crossing events · {warningLog.length} event{warningLog.length !== 1 ? "s" : ""} recorded</div>
                </div>
              </div>

              {/* Current status card */}
              <div className="g2" style={{ marginBottom: 20 }}>
                <div className={`stat${current.Anomaly_Score > 0.5 ? "" : " stat-green"}`}>
                  <div className="stat-label">Current Anomaly Score</div>
                  <div className="stat-val">{current.Anomaly_Score.toFixed(3)}</div>
                  <div className={`stat-badge${current.Anomaly_Score > 0.5 ? " warn" : ""}`}>
                    {current.Anomaly_Score > 0.5 ? "⚠ Above Threshold" : "Normal"}
                  </div>
                </div>
                <div className={`stat${warningLog.length > 0 ? "" : " stat-green"}`}>
                  <div className="stat-label">Total Alert Events</div>
                  <div className="stat-val">{warningLog.length}</div>
                  <div className={`stat-badge${warningLog.length > 0 ? " warn" : ""}`}>
                    {warningLog.length === 0 ? "No alerts" : `${warningLog.length} alert${warningLog.length !== 1 ? "s" : ""}`}
                  </div>
                </div>
              </div>

              {warningLog.length === 0 ? (
                <div className="ncard" style={{ textAlign: "center", padding: "48px 24px", color: "var(--green-600)", borderLeftColor: "var(--green-500)" }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>✓</div>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>No alerts recorded</div>
                  <div style={{ fontSize: 13, opacity: 0.75 }}>Play through the data to detect anomaly threshold crossings.</div>
                </div>
              ) : (
                <div className="card">
                  <div className="card-header">
                    <div>
                      <div className="card-title">Warning Log</div>
                      <div className="card-sub">Anomaly score crossed 0.5 — most recent first · {warningLog.length} event{warningLog.length !== 1 ? "s" : ""}</div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        className="btn-primary"
                        style={{ fontSize: 12, padding: "6px 14px", background: "var(--green-700)" }}
                        onClick={() => {
                          const headers = ["#","Time Step","Anomaly Score","pH","Temperature (°C)","Turbidity In (NTU)","Turbidity Out (NTU)","Flow Rate (L/min)","Head Loss (m)","Detected At"];
                          const rows = warningLog.map((w, i) => [
                            warningLog.length - i,
                            w.step + 1,
                            w.score.toFixed(4),
                            w.ph.toFixed(2),
                            w.temperature.toFixed(2),
                            w.turbIn.toFixed(2),
                            w.turbOut.toFixed(2),
                            w.flowRate.toFixed(2),
                            w.headLoss.toFixed(3),
                            w.time,
                          ]);
                          const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
                          const blob = new Blob([csv], { type: "text/csv" });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = url; a.download = "biofilter_alerts.csv"; a.click();
                          URL.revokeObjectURL(url);
                        }}
                      >
                        ↓ Export CSV
                      </button>
                      <button className="btn-primary" style={{ fontSize: 12, padding: "6px 14px" }} onClick={() => setWarningLog([])}>
                        Clear Log
                      </button>
                    </div>
                  </div>
                  <div style={{ marginTop: 16, overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                      <thead>
                        <tr>
                          {["#","Step","Score","pH","Temp °C","Turb In","Turb Out","Flow Rate","Head Loss","Time"].map((h) => (
                            <th key={h} style={{ padding: "8px 10px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "var(--warm-400)", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1px solid var(--warm-100)", whiteSpace: "nowrap" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {warningLog.map((w, i) => (
                          <tr
                            key={i}
                            style={{ background: i % 2 === 0 ? "rgba(245,158,11,0.04)" : "transparent", cursor: "pointer" }}
                            onClick={() => setStep(w.step)}
                            title="Jump to this step"
                          >
                            <td style={{ padding: "9px 10px", fontWeight: 700, color: "var(--amber-600)" }}>#{warningLog.length - i}</td>
                            <td style={{ padding: "9px 10px", fontWeight: 600, color: "var(--warm-700)" }}>{w.step + 1}</td>
                            <td style={{ padding: "9px 10px" }}><span className="badge bu">{w.score.toFixed(3)}</span></td>
                            <td style={{ padding: "9px 10px", color: (w.ph < 6.5 || w.ph > 8.5) ? "var(--amber-600)" : "var(--warm-700)", fontWeight: 500 }}>{w.ph.toFixed(2)}</td>
                            <td style={{ padding: "9px 10px", color: w.temperature > 35 ? "var(--amber-600)" : "var(--warm-700)", fontWeight: 500 }}>{w.temperature.toFixed(1)}</td>
                            <td style={{ padding: "9px 10px", color: w.turbIn > 50 ? "var(--amber-600)" : "var(--warm-700)", fontWeight: 500 }}>{w.turbIn.toFixed(2)}</td>
                            <td style={{ padding: "9px 10px", color: w.turbOut > 5 ? "var(--amber-600)" : "var(--warm-700)", fontWeight: 500 }}>{w.turbOut.toFixed(2)}</td>
                            <td style={{ padding: "9px 10px", color: "var(--warm-700)", fontWeight: 500 }}>{w.flowRate.toFixed(1)}</td>
                            <td style={{ padding: "9px 10px", color: w.headLoss > 1.5 ? "var(--amber-600)" : "var(--warm-700)", fontWeight: 500 }}>{w.headLoss.toFixed(3)}</td>
                            <td style={{ padding: "9px 10px", color: "var(--warm-400)", whiteSpace: "nowrap" }}>{w.time}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}

          <div className="footer">
            <span>Biofilter Predictive Maintenance System · Real-time sensor data</span>
            <span>Time Step {step + 1} of {data.length}</span>
          </div>
        </div>
      </div>

      {/* =================== TOAST STACK =================== */}
      {toasts.length > 0 && (
        <div className="toast-stack" onClick={() => { toasts.forEach((t) => dismissToast(t.id)); setPage("alerts"); }}>
          {/* Show at most 3 toasts stacked; oldest on bottom, newest on top */}
          {toasts.slice(-3).map((t, idx, arr) => {
            const fromTop = arr.length - 1 - idx; // 0 = front/top, 1 = behind, 2 = furthest
            const scale = 1 - fromTop * 0.04;
            const translateY = fromTop * 10;
            const opacity = 1 - fromTop * 0.25;
            return (
              <div
                key={t.id}
                className={`toast${t.exiting ? " exiting" : ""}`}
                style={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  transform: `translateY(-${translateY}px) scale(${scale})`,
                  opacity,
                  zIndex: 9999 - fromTop,
                  transition: "transform .3s cubic-bezier(.22,1,.36,1), opacity .3s",
                  transformOrigin: "bottom center",
                }}
              >
                <div className="toast-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                  </svg>
                </div>
                <div className="toast-body">
                  <div className="toast-title">
                    Anomaly Detected
                    {toasts.length > 1 && fromTop === 0 && (
                      <span style={{ marginLeft: 8, background: "var(--amber-500)", color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 50, verticalAlign: "middle" }}>
                        {toasts.length}
                      </span>
                    )}
                  </div>
                  <div className="toast-msg">Step {t.step + 1} · Score {t.score.toFixed(3)} · {t.time}</div>
                  {fromTop === 0 && (
                    <div className="toast-hint">
                      <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6"/>
                      </svg>
                      Click to view all alerts
                    </div>
                  )}
                </div>
                {fromTop === 0 && (
                  <button
                    className="toast-close"
                    onClick={(e) => { e.stopPropagation(); toasts.forEach((x) => dismissToast(x.id)); }}
                    aria-label="Dismiss all"
                  >×</button>
                )}
                {fromTop === 0 && <div className="toast-bar" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
