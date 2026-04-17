"use client";
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from "recharts";

interface Props { value: number }

export default function PhGauge({ value }: Props) {
  const getColor = (pH: number) => {
    if (pH < 6 || pH > 9) return "#ef4444";
    if (pH < 7 || pH > 8) return "#f59e0b";
    return "#16a34a";
  };
  const color = getColor(value);
  const pct = (value / 14) * 100;
  const chartData = [{ name: "pH", value: pct, fill: color }];
  const label = value < 6 || value > 9 ? "Critical" : value < 7 || value > 8 ? "Caution" : "Optimal";
  const badgeCls = value < 6 || value > 9 ? "br" : value < 7 || value > 8 ? "bn" : "bu";

  return (
    <div className="kpi" style={{ "--kpi-accent": color } as React.CSSProperties}>
      <div className="kl">pH Level</div>
      <div style={{ height: 148, position: "relative" }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%" cy="100%" innerRadius="60%" outerRadius="100%"
            startAngle={180} endAngle={0}
            data={chartData} barSize={14}
          >
            <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
            <RadialBar background dataKey="value" angleAxisId={0} cornerRadius={8} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, display: "flex", justifyContent: "space-between", padding: "0 14px" }}>
          <span style={{ fontSize: 10, color: "var(--warm-400)", fontWeight: 600 }}>0</span>
          <span style={{ fontSize: 10, color: "var(--warm-400)", fontWeight: 600 }}>14</span>
        </div>
      </div>
      <div style={{ textAlign: "center", marginTop: 6 }}>
        <div className="kvx" style={{ color }}>{value.toFixed(1)}</div>
        <div className="kd">pH units</div>
      </div>
      <div className="kb">
        <span className={`badge ${badgeCls}`}>{label}</span>
        <span className="kn">Normal range: 7–8</span>
      </div>
    </div>
  );
}
