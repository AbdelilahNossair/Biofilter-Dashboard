"use client";
import { LineChart, Line, ResponsiveContainer } from "recharts";

interface Props {
  label: string;
  value: string;
  unit: string;
  status: "Normal" | "Warning";
  sparkData: number[];
  color: string;
  variant?: "green";
}

export default function KpiCard({ label, value, unit, status, sparkData, color, variant }: Props) {
  const isWarning = status === "Warning";
  const isGreen = variant === "green";
  const chartData = sparkData.map((v) => ({ v }));
  const strokeColor = isGreen ? "rgba(255,255,255,0.75)" : color;

  return (
    <div className={`stat${isGreen ? " stat-green" : ""}`}>
      <div className="stat-label">{label}</div>
      <div className="stat-val">{value}</div>
      <div className="stat-sub">
        <span className={`stat-badge${isWarning ? " warn" : ""}`}>
          {isWarning ? "⚠ Warning" : "✓ Normal"}
        </span>
        {unit && <span>{unit}</span>}
      </div>
      <div style={{ height: 38, marginTop: 6 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <Line type="monotone" dataKey="v" stroke={strokeColor} strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
