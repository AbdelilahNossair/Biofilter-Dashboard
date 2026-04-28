"use client";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";

interface Row { Time_Step: number; Head_Loss: number; [k: string]: number }
interface Props { data: Row[] }

const tooltipStyle = {
  backgroundColor: "#1a0a0f",
  border: "none",
  borderRadius: 12,
  fontSize: 12,
  color: "#e2e8f0",
  padding: "12px",
};

export default function HeadLossChart({ data }: Props) {
  const chartData = data.map((d) => ({
    time: d.Time_Step,
    below: Math.min(d.Head_Loss, 1.5),
    above: d.Head_Loss > 1.5 ? d.Head_Loss : null,
  }));

  return (
    <div className="card" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div className="card-header">
        <div>
          <div className="card-title">Head Loss Over Time</div>
          <div className="card-sub">Pressure drop across biofiltration media (m)</div>
        </div>
        <div className="card-action">Details</div>
      </div>
      <div style={{ flex: 1, minHeight: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 16, bottom: 20, left: 8 }}>
            <defs>
              <linearGradient id="greenFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(139,30,63,0.28)" />
                <stop offset="100%" stopColor="rgba(139,30,63,0.01)" />
              </linearGradient>
              <linearGradient id="amberFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(245,158,11,0.28)" />
                <stop offset="100%" stopColor="rgba(245,158,11,0.01)" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 11, fill: "#b0aba3", fontWeight: 600 }}
              label={{ value: "Time Step", position: "insideBottom", offset: -10, fontSize: 11, fill: "#b0aba3" }}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#b0aba3", fontWeight: 600 }}
              label={{ value: "Head Loss (m)", angle: -90, position: "insideLeft", offset: 5, fontSize: 11, fill: "#b0aba3" }}
            />
            <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "#94a3b8" }} />
            <ReferenceLine
              y={1.5}
              stroke="#f59e0b"
              strokeDasharray="8 4"
              strokeWidth={2}
              label={{ value: "Maintenance Required", position: "insideTopRight", fill: "#d97706", fontSize: 11, fontWeight: 700 }}
            />
            <Area type="monotone" dataKey="below" stroke="#8b1e3f" strokeWidth={2.5} fill="url(#greenFill)" />
            <Area type="monotone" dataKey="above" stroke="#f59e0b" strokeWidth={2.5} fill="url(#amberFill)" connectNulls={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
