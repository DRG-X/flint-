import { useState } from "react";
import { useRouter } from "next/router";
import { CURRENCIES } from "../lib/currencies";

/**
 * CompareWidget — standalone compare form.
 * Works identically on the landing page and the authenticated dashboard.
 * On submit it navigates to /results?from=X&to=Y&amount=Z.
 *
 * Props:
 *   defaultFrom   {string}  — pre-selected "from" currency (default: "GBP")
 *   defaultTo     {string}  — pre-selected "to" currency   (default: "INR")
 *   defaultAmount {number}  — pre-filled amount             (default: 1000)
 */
export default function CompareWidget({ defaultFrom = "GBP", defaultTo = "INR", defaultAmount = 1000 }) {
  const router = useRouter();
  const [amount, setAmount]   = useState(String(defaultAmount));
  const [from, setFrom]       = useState(defaultFrom);
  const [to, setTo]           = useState(defaultTo);
  const [navigating, setNavigating] = useState(false);
  const [error, setError]     = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    const parsed = parseFloat(amount);
    if (!amount || isNaN(parsed) || parsed <= 0) {
      setError("Enter a positive amount.");
      return;
    }
    if (from === to) {
      setError("Send and receive currencies must be different.");
      return;
    }

    setNavigating(true);
    router.push(`/results?from=${from}&to=${to}&amount=${parsed}`);
  };

  return (
    <form onSubmit={handleSubmit} className="cw-form" id="compare-widget">
      <div className="cw-fields">
        {/* Amount */}
        <div className="field">
          <label htmlFor="cw-amount">Amount</label>
          <input
            id="cw-amount"
            type="number"
            min="1"
            step="0.01"
            placeholder="1000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={navigating}
          />
        </div>

        {/* From */}
        <div className="field">
          <label htmlFor="cw-from">You send</label>
          <select
            id="cw-from"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            disabled={navigating}
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.flag} {c.code} — {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* To */}
        <div className="field">
          <label htmlFor="cw-to">Recipient gets</label>
          <select
            id="cw-to"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            disabled={navigating}
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.flag} {c.code} — {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Submit */}
        <div className="field cw-btn-wrap">
          <label className="cw-btn-label">&nbsp;</label>
          <button className="btn-compare" type="submit" disabled={navigating} id="cw-submit">
            {navigating ? (
              <span style={{ display: "flex", alignItems: "center", gap: "0.5rem", justifyContent: "center" }}>
                <span className="spinner" style={{ width: 14, height: 14, margin: 0, borderWidth: 2 }} />
                Loading…
              </span>
            ) : (
              "Compare →"
            )}
          </button>
        </div>
      </div>

      {error && <p className="cw-error">{error}</p>}

      <style jsx>{`
        .cw-form { width: 100%; }
        .cw-fields {
          display: grid;
          grid-template-columns: 1.4fr 1fr 1fr auto;
          gap: 0.75rem;
          align-items: end;
        }
        @media (max-width: 700px) {
          .cw-fields { grid-template-columns: 1fr; }
          .cw-btn-label { display: none; }
        }
        .cw-btn-wrap { min-width: 130px; }
        .cw-btn-label { display: block; font-size: 0.65rem; letter-spacing: 0.14em; text-transform: uppercase; color: var(--muted); margin-bottom: 0.5rem; }
        .cw-error { color: var(--red); font-size: 0.8rem; margin-top: 0.5rem; }
      `}</style>
    </form>
  );
}
