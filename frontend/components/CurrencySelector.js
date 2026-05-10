import { CURRENCIES } from "../lib/currencies";

/**
 * CurrencySelector — styled currency <select> with flag emoji.
 * Props:
 *   value      string    — selected currency code
 *   onChange   fn        — (newCode: string) => void
 *   label      string    — field label
 *   id         string    — input id (for accessibility)
 *   disabled   boolean
 *   className  string
 */
export default function CurrencySelector({
  value,
  onChange,
  label,
  id,
  disabled = false,
  className = "",
  currencies = CURRENCIES,
}) {
  const selected = currencies.find((c) => c.code === value);

  return (
    <div className={`cs-wrap field ${className}`}>
      {label && <label htmlFor={id}>{label}</label>}
      <div className="cs-inner">
        {selected && <span className="cs-flag">{selected.flag}</span>}
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="cs-select"
        >
          {currencies.map((c) => (
            <option key={c.code} value={c.code}>
              {c.flag} {c.code} — {c.name}
            </option>
          ))}
        </select>
      </div>

      <style jsx>{`
        .cs-wrap { position: relative; }
        .cs-inner {
          position: relative;
          display: flex;
          align-items: center;
        }
        .cs-flag {
          position: absolute;
          left: 0.75rem;
          z-index: 1;
          font-size: 1rem;
          pointer-events: none;
        }
        .cs-select {
          width: 100%;
          background: var(--surface-highest);
          border: none;
          border-radius: var(--radius-sm);
          color: var(--text);
          font-family: var(--font-body);
          font-size: 0.95rem;
          font-weight: 500;
          padding: 0.75rem 0.9rem 0.75rem 2.4rem;
          outline: none;
          appearance: none;
          cursor: pointer;
          transition: background 0.15s, box-shadow 0.15s;
        }
        .cs-select:focus {
          background: var(--surface-float);
          box-shadow: 0 0 0 2px var(--secondary);
        }
        .cs-select:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>
    </div>
  );
}
