"use client";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";

interface Row { Time_Step: number; Anomaly_Score: number; [k: string]: number }
interface Props { data: Row[] }

const tooltipStyle = {
  backgroundColor: "#1a0a0f",
  border: "none",
  borderRadius: 12,
  fontSize: 12,
  color: "#e2e8f0",
  padding: "12px",
};

export default function AnomalyChart({ data }: Props) {
  const chartData = data.map((d) => ({ time: d.Time_Step, score: d.Anomaly_Score }));

  return (
    <div className="card" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div className="card-header">
        <div>
          <div className="card-title">Anomaly Score</div>
          <div className="card-sub">ML-based anomaly detection</div>
        </div>
      </div>
      <div style={{ flex: 1, minHeight: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 16, bottom: 20, left: 8 }}>
            <defs>
              <linearGradient id="anomGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(245,158,11,0.28)" />
                <stop offset="100%" stopColor="rgba(245,158,11,0.01)" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
            <XAxis dataKey="time" tick={{ fontSize: 11, fill: "#b0aba3", fontWeight: 600 }} />
            <YAxis domain={[0, 1]} tick={{ fontSize: 11, fill: "#b0aba3", fontWeight: 600 }} />
            <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "#94a3b8" }} />
            <ReferenceLine
              y={0.5}
              stroke="#ef4444"
              strokeDasharray="4 4"
              strokeWidth={2}
              label={{ value: "Threshold", position: "insideTopRight", fill: "#ef4444", fontSize: 11, fontWeight: 700 }}
            />
            <Area type="monotone" dataKey="score" stroke="#f59e0b" strokeWidth={2.5} fill="url(#anomGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
