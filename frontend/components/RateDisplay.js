import { useEffect, useRef, useState } from "react";

/**
 * RateDisplay — Animated currency amount with optional highlight (emerald).
 * Props:
 *   amount    number     — the numeric value to display
 *   currency  string     — e.g. "INR"
 *   size      "lg"|"md"|"sm"
 *   highlight boolean    — if true, renders in var(--tertiary) emerald
 *   decimals  number     — decimal places (default: 2)
 */
export default function RateDisplay({ amount, currency, size = "md", highlight = false, decimals = 2 }) {
  const [displayed, setDisplayed] = useState(0);
  const animRef = useRef(null);
  const startRef = useRef(null);

  useEffect(() => {
    if (amount == null || isNaN(amount)) return;
    const target = parseFloat(amount);
    const duration = 600;
    const startVal = displayed;

    if (animRef.current) cancelAnimationFrame(animRef.current);
    startRef.current = null;

    const step = (timestamp) => {
      if (!startRef.current) startRef.current = timestamp;
      const progress = Math.min((timestamp - startRef.current) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(startVal + (target - startVal) * eased);
      if (progress < 1) animRef.current = requestAnimationFrame(step);
    };
    animRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animRef.current);
  }, [amount]);

  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(displayed);

  return (
    <span className={`rate-display rate-${size} ${highlight ? "rate-highlight" : ""}`}>
      {formatted}
      {currency && <span className="rate-currency"> {currency}</span>}
      <style jsx>{`
        .rate-display {
          font-family: var(--font-display);
          font-weight: 800;
          letter-spacing: -0.03em;
          line-height: 1;
          display: inline-block;
        }
        .rate-lg { font-size: 2.8rem; }
        .rate-md { font-size: 1.8rem; }
        .rate-sm { font-size: 1.2rem; }
        .rate-highlight { color: var(--tertiary); }
        .rate-currency {
          font-size: 0.45em;
          font-weight: 600;
          letter-spacing: 0.02em;
          opacity: 0.7;
          vertical-align: middle;
        }
      `}</style>
    </span>
  );
}
