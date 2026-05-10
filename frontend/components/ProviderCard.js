import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { saveComparison } from "../lib/api";

const PROVIDER_URLS = {
  Wise: "https://wise.com",
  Remitly: "https://remitly.com",
  "Western Union": "https://westernunion.com",
  XE: "https://xe.com",
  Revolut: "https://revolut.com",
};

/**
 * ProviderCard — single provider result card on /results page.
 * Props:
 *   provider     object   — rate result object from /api/rates
 *   rank         number   — 1-based rank
 *   isBest       boolean  — show "Best Value" pill
 *   sortBy       string   — "rate" | "fee" | "speed"
 *   onAlert      fn       — opens AlertModal
 *   ratesData    object   — full rates response (for saveComparison payload)
 */
export default function ProviderCard({ provider, rank, isBest, sortBy, onAlert, ratesData }) {
  const { isSignedIn, getToken } = useAuth();
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const fmt = (n, dec = 2) =>
    new Intl.NumberFormat("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec }).format(n);

  const handleSave = async () => {
    if (!isSignedIn || saving || saved) return;
    setSaving(true);
    try {
      const token = await getToken();
      await saveComparison(token, {
        amount: provider.send_amount,
        from_currency: provider.currency_from,
        to_currency: provider.currency_to,
        results_json: JSON.stringify(ratesData?.results || []),
      });
      setSaved(true);
    } catch {
      // silent — non-critical
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`pc-card ${isBest ? "pc-best" : ""}`}>
      {/* Rank + Name */}
      <div className="pc-header">
        <div className="pc-left">
          <span className={`rank-badge rank-${Math.min(rank, 3)}`}>{rank}</span>
          <div>
            <div className="pc-name">{provider.provider}</div>
            {isBest && sortBy === "rate" && (
              <span className="pill pill-secondary" style={{ fontSize: "0.65rem", marginTop: "0.2rem" }}>⭐ Best Value</span>
            )}
          </div>
        </div>
        <div className="pc-receive">
          <div className="pc-receive-label">Recipient gets</div>
          <div className="pc-receive-amount">
            {fmt(provider.receive_amount)}
            <span className="pc-receive-ccy"> {provider.currency_to}</span>
          </div>
        </div>
      </div>

      {/* Meta row */}
      <div className="pc-meta">
        <div className="pc-meta-item">
          <span className="pc-meta-label">Rate</span>
          <span className="pc-meta-val">{fmt(provider.exchange_rate, 4)}</span>
        </div>
        <div className="pc-meta-item">
          <span className="pc-meta-label">Total fee</span>
          <span className="pc-meta-val">{provider.currency_from} {fmt(provider.fee)}</span>
        </div>
        <div className="pc-meta-item">
          <span className="pc-meta-label">Delivery</span>
          <span className="pc-meta-val">{provider.transfer_time || "—"}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="pc-actions">
        {isSignedIn ? (
          <button
            className="btn-ghost-sm"
            onClick={handleSave}
            disabled={saving || saved}
            id={`save-${provider.provider.toLowerCase().replace(/\s/g,"-")}`}
          >
            {saved ? "✓ Saved" : saving ? "Saving…" : "💾 Save"}
          </button>
        ) : null}
        {isSignedIn ? (
          <button
            className="btn-ghost-sm"
            onClick={() => onAlert && onAlert(provider)}
            id={`alert-${provider.provider.toLowerCase().replace(/\s/g,"-")}`}
          >
            🔔 Alert
          </button>
        ) : (
          <Link
            href="/auth?mode=signup"
            className="btn-ghost-sm"
            style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}
            id={`alert-${provider.provider.toLowerCase().replace(/\s/g,"-")}`}
          >
            🔔 Alert
          </Link>
        )}
        <a
          href={PROVIDER_URLS[provider.provider] || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className={isBest ? "pc-cta-primary" : "pc-cta-ghost"}
          id={`send-${provider.provider.toLowerCase().replace(/\s/g,"-")}`}
        >
          Send with {provider.provider} →
        </a>
      </div>

      <style jsx>{`
        .pc-card {
          background: var(--surface-float);
          border-radius: var(--radius-lg);
          padding: 1.5rem;
          box-shadow: var(--shadow-sm);
          transition: box-shadow 0.2s, transform 0.15s;
        }
        .pc-card:hover { box-shadow: var(--shadow-md); transform: translateY(-1px); }
        .pc-best {
          box-shadow: 0 0 0 2px var(--secondary), var(--shadow-md);
        }
        .pc-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; margin-bottom: 1rem; }
        .pc-left { display: flex; align-items: center; gap: 0.75rem; }
        .pc-name { font-family: var(--font-display); font-weight: 700; font-size: 1.1rem; color: var(--text); }
        .pc-receive { text-align: right; }
        .pc-receive-label { font-size: 0.65rem; letter-spacing: 0.05em; text-transform: uppercase; color: var(--muted); margin-bottom: 0.2rem; }
        .pc-receive-amount { font-family: var(--font-display); font-size: 1.6rem; font-weight: 800; letter-spacing: -0.03em; color: var(--tertiary); line-height: 1; }
        .pc-receive-ccy { font-size: 0.7rem; font-weight: 600; color: var(--muted); }
        .pc-meta { display: flex; gap: 1.5rem; flex-wrap: wrap; padding: 0.75rem 0; border-top: 1px solid var(--surface-high); border-bottom: 1px solid var(--surface-high); margin-bottom: 1rem; }
        .pc-meta-item { display: flex; flex-direction: column; gap: 0.15rem; }
        .pc-meta-label { font-size: 0.65rem; letter-spacing: 0.05em; text-transform: uppercase; color: var(--muted); font-weight: 600; }
        .pc-meta-val { font-family: var(--font-body); font-size: 0.9rem; font-weight: 600; color: var(--text-mid); }
        .pc-actions { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
        .pc-cta-primary {
          margin-left: auto;
          display: inline-flex; align-items: center;
          background: var(--secondary); color: white;
          font-family: var(--font-display); font-weight: 700; font-size: 0.85rem;
          border-radius: var(--radius-md); padding: 0.55rem 1.1rem;
          text-decoration: none; border: none;
          transition: opacity 0.15s, transform 0.1s;
        }
        .pc-cta-primary:hover { opacity: 0.9; transform: translateY(-1px); }
        .pc-cta-ghost {
          margin-left: auto;
          display: inline-flex; align-items: center;
          background: transparent; color: var(--text-mid);
          font-family: var(--font-body); font-weight: 500; font-size: 0.85rem;
          border: 1px solid var(--outline); border-radius: var(--radius-md);
          padding: 0.55rem 1.1rem;
          text-decoration: none;
          transition: border-color 0.15s, color 0.15s;
        }
        .pc-cta-ghost:hover { border-color: var(--secondary); color: var(--secondary); }
      `}</style>
    </div>
  );
}
