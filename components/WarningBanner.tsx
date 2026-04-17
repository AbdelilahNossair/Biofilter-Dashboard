"use client";

export default function WarningBanner() {
  return (
    <div className="ncard" style={{ borderLeftColor: "var(--amber-500)" }}>
      <div className="nh">
        <span className="ni">
          <svg viewBox="0 0 24 24" fill="none" stroke="var(--amber-500)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </span>
        <span className="nt">Maintenance Warning</span>
      </div>
      <div className="ntxt">
        Anomaly score has exceeded the safety threshold (0.5). Immediate inspection of the biofilter system is recommended.
      </div>
    </div>
  );
}
