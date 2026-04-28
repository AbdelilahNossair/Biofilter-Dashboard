"use client";
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from "recharts";

interface Props { value: number }

export default function TempGauge({ value }: Props) {
  const getColor = (t: number) => {
    if (t < 15) return "#7a233f";
    if (t <= 30) return "#151518";
    return "#ef4444";
  };
  const color = getColor(value);
  const pct = (value / 40) * 100;
  const chartData = [{ name: "Temp", value: pct, fill: color }];
  const label = value < 15 ? "Cold" : value <= 30 ? "Optimal" : "Hot";
  const badgeCls = value < 15 ? "bn" : value <= 30 ? "bu" : "br";

  return (
    <div className="kpi" style={{ "--kpi-accent": color } as React.CSSProperties}>
      <div className="kl">Temperature</div>
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
          <span style={{ fontSize: 10, color: "var(--warm-400)", fontWeight: 600 }}>0 °C</span>
          <span style={{ fontSize: 10, color: "var(--warm-400)", fontWeight: 600 }}>40 °C</span>
        </div>
      </div>
      <div style={{ textAlign: "center", marginTop: 6 }}>
        <div className="kvx" style={{ color }}>{value.toFixed(1)}</div>
        <div className="kd">°C</div>
      </div>
      <div className="kb">
        <span className={`badge ${badgeCls}`}>{label}</span>
        <span className="kn">Optimal: 15–30 °C</span>
      </div>
    </div>
  );
}
