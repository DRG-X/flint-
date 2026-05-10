/**
 * StatCard — Metric display card.
 * Props:
 *   label    string   — eyebrow label
 *   value    string   — main value
 *   trend    string   — e.g. "+12%" (optional)
 *   icon     string   — emoji (optional)
 *   loading  boolean
 */
export default function StatCard({ label, value, trend, icon, loading = false }) {
  const isPositive = trend && !trend.startsWith("-");
  return (
    <div className="stat-card">
      <div className="stat-header">
        {icon && <span className="stat-icon">{icon}</span>}
        <span className="label-sm">{label}</span>
      </div>
      {loading ? (
        <div className="skeleton-line" style={{ height: 32, width: "60%", marginTop: "0.5rem" }} />
      ) : (
        <div className="stat-value-row">
          <span className="stat-value">{value ?? "—"}</span>
          {trend && (
            <span className={`stat-trend ${isPositive ? "trend-up" : "trend-down"}`}>
              {isPositive ? "↑" : "↓"} {trend}
            </span>
          )}
        </div>
      )}
      <style jsx>{`
        .stat-card { background: var(--surface-float); border-radius: var(--radius-md); padding: 1.25rem; box-shadow: var(--shadow-sm); }
        .stat-header { display: flex; align-items: center; gap: 0.4rem; margin-bottom: 0.5rem; }
        .stat-icon { font-size: 1rem; }
        .stat-value-row { display: flex; align-items: baseline; gap: 0.5rem; flex-wrap: wrap; }
        .stat-value { font-family: var(--font-display); font-size: 1.6rem; font-weight: 800; letter-spacing: -0.03em; color: var(--text); line-height: 1.1; }
        .stat-trend { font-size: 0.75rem; font-weight: 600; padding: 0.15rem 0.5rem; border-radius: var(--radius-full); }
        .trend-up { background: var(--tertiary-dim); color: var(--tertiary); }
        .trend-down { background: rgba(186,26,26,0.1); color: var(--error); }
      `}</style>
    </div>
  );
}
