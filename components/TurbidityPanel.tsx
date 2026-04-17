"use client";

interface Props { turbIn: number; turbOut: number }

export default function TurbidityPanel({ turbIn, turbOut }: Props) {
  const pctIn = Math.min((turbIn / 100) * 100, 100);
  const pctOut = Math.min((turbOut / 100) * 100, 100);
  const reduction = turbIn > 0 ? Math.round(((turbIn - turbOut) / turbIn) * 100) : 0;

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <div className="card-title">Turbidity</div>
          <div className="card-sub">Inlet vs. Outlet (NTU)</div>
        </div>
      </div>

      {/* Inlet */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--warm-400)", textTransform: "uppercase", letterSpacing: ".06em" }}>Inlet</span>
          <span style={{ fontSize: 22, fontWeight: 800, fontFamily: "'DM Mono',monospace", letterSpacing: "-.03em", color: "var(--warm-900)" }}>
            {turbIn.toFixed(1)}
            <span style={{ fontSize: 12, fontWeight: 500, color: "var(--warm-400)", marginLeft: 3 }}>NTU</span>
          </span>
        </div>
        <div className="pbar-wrap">
          <div className="pbar-fill" style={{ width: `${pctIn}%`, background: "var(--green-600)" }} />
        </div>
      </div>

      {/* Outlet */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--warm-400)", textTransform: "uppercase", letterSpacing: ".06em" }}>Outlet</span>
          <span style={{ fontSize: 22, fontWeight: 800, fontFamily: "'DM Mono',monospace", letterSpacing: "-.03em", color: "var(--warm-900)" }}>
            {turbOut.toFixed(1)}
            <span style={{ fontSize: 12, fontWeight: 500, color: "var(--warm-400)", marginLeft: 3 }}>NTU</span>
          </span>
        </div>
        <div className="pbar-wrap">
          <div className="pbar-fill" style={{ width: `${pctOut}%`, background: "var(--green-400)" }} />
        </div>
      </div>

      {/* Summary chips */}
      <div className="chips">
        <div className="chip">
          <div className="chip-l">Inlet</div>
          <div className="chip-v" style={{ color: "var(--warm-700)" }}>{turbIn.toFixed(0)}</div>
        </div>
        <div className="chip">
          <div className="chip-l">Outlet</div>
          <div className="chip-v" style={{ color: "var(--green-700)" }}>{turbOut.toFixed(0)}</div>
        </div>
        <div className="chip">
          <div className="chip-l">Removal</div>
          <div className="chip-v" style={{ color: "var(--green-700)" }}>{reduction}%</div>
        </div>
      </div>
    </div>
  );
}
