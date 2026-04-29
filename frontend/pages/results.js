import { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth, useUser } from "@clerk/nextjs";
import { getRates, saveComparison } from "../lib/api";
import AlertModal from "../components/AlertModal";

const fmt = (n) =>
  new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

const fmtRate = (n) =>
  new Intl.NumberFormat("en-US", { minimumFractionDigits: 4, maximumFractionDigits: 6 }).format(n);

const PROVIDER_URLS = {
  Wise: "https://wise.com",
  Remitly: "https://remitly.com",
  "Western Union": "https://westernunion.com",
};

const TIPS = [
  {
    title: "Use Bank Transfers for Better Rates",
    desc: "Funding via direct bank transfer typically unlocks the absolute best exchange rates. Credit card funding often incurs surcharges up to 3%.",
  },
  {
    title: "Watch the Clock",
    desc: "Exchange rates can fluctuate significantly during trading session overlaps. Monitor rates at different times during the week.",
  },
  {
    title: "IMPS vs NEFT for India",
    desc: "Choose providers that support IMPS (Immediate Payment Service) for real-time settlement 24/7, even on bank holidays.",
  },
  {
    title: "Tax Implications (LRS)",
    desc: "Under India's Liberalised Remittance Scheme, outward remittances are tracked. Understand TCS rules for significant amounts.",
  },
];

function ProviderCard({ quote, rank, isBest, isSignedIn, saved, onSave, onAlert }) {
  const providerUrl = PROVIDER_URLS[quote.provider] || `https://www.${quote.provider.toLowerCase().replace(/\s/g, "")}.com`;

  return (
    <div className={`prov-card ${isBest ? "prov-card-best" : ""}`}>
      {isBest && (
        <div style={{ marginBottom: "1rem" }}>
          <span className="pill pill-secondary" style={{ fontSize: "0.65rem", letterSpacing: "0.05em" }}>
            ⭐ Best Value
          </span>
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span className="rank-badge" style={isBest ? { background: "var(--secondary)", color: "white" } : { background: "var(--surface-high)", color: "var(--muted)" }}>
            {rank}
          </span>
          <span style={{ fontFamily: "var(--font-display)", fontSize: "1.15rem", fontWeight: 700, color: "var(--text)", letterSpacing: "-0.01em" }}>
            {quote.provider}
          </span>
        </div>
        {isSignedIn && (
          <div style={{ display: "flex", gap: "0.4rem" }}>
            <button className="btn-ghost-sm" onClick={onSave} disabled={saved} aria-label="Save search">
              {saved ? "✓ Saved" : "Save"}
            </button>
            <button className="btn-ghost-sm" onClick={() => onAlert(quote)} aria-label="Set rate alert">
              🔔
            </button>
          </div>
        )}
      </div>

      {/* Hero amount */}
      <div style={{ marginBottom: "1.25rem" }}>
        <div className="label-sm" style={{ marginBottom: "0.4rem" }}>Recipient gets</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: "0.4rem" }}>
          <span style={{ fontFamily: "var(--font-display)", fontSize: "2.5rem", fontWeight: 800, color: isBest ? "var(--tertiary)" : "var(--text)", letterSpacing: "-0.03em", lineHeight: 1 }}>
            {fmt(quote.receive_amount)}
          </span>
          <span style={{ fontSize: "1.1rem", color: "var(--muted)", fontWeight: 500 }}>
            {quote.currency_to}
          </span>
        </div>
      </div>

      {/* Meta row */}
      <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
        {[
          { label: "Rate", value: fmtRate(quote.exchange_rate) },
          { label: "Total fee", value: quote.fee === 0 ? "Free" : `${quote.currency_from} ${fmt(quote.fee)}` },
          { label: "Delivery", value: quote.transfer_time },
        ].map(m => (
          <div key={m.label}>
            <div className="label-sm" style={{ marginBottom: "0.15rem" }}>{m.label}</div>
            <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text-mid)" }}>{m.value}</div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <a
        href={providerUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={isBest ? "btn-secondary" : "btn-ghost"}
        style={{ display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", width: "100%", padding: "0.75rem" }}
        id={`select-${quote.provider.toLowerCase().replace(/\s/g, "-")}`}
      >
        {isBest ? `Send with ${quote.provider} →` : `Select ${quote.provider}`}
      </a>
    </div>
  );
}

export default function Results() {
  const router = useRouter();
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { user } = useUser();

  const { from, to, amount } = router.query;
  const parsedAmount = parseFloat(amount) || 1000;

  const [fromVal, setFromVal] = useState(from || "GBP");
  const [toVal, setToVal] = useState(to || "INR");
  const [amountVal, setAmountVal] = useState(String(parsedAmount));

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState("amount");
  const [alertModal, setAlertModal] = useState({ open: false, quote: null });
  const [savedIds, setSavedIds] = useState(new Set());
  const [scrolled, setScrolled] = useState(false);

  const CURRENCIES = ["GBP","USD","EUR","AUD","CAD","SGD","AED","INR","PHP","NGN","PKR","BDT","LKR"];

  useEffect(() => {
    if (from) setFromVal(from);
    if (to) setToVal(to);
    if (amount) setAmountVal(String(amount));
  }, [from, to, amount]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const fetchRates = useCallback(async () => {
    if (!from || !to || !amount) return;
    setLoading(true);
    setError("");
    try {
      const result = await getRates({ from, to, amount: parsedAmount });
      setData(result);
    } catch (err) {
      setError(err.message || "Failed to fetch rates. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }, [from, to, amount, parsedAmount]);

  useEffect(() => {
    if (router.isReady) fetchRates();
  }, [router.isReady, fetchRates]);

  useEffect(() => {
    if (data?.stale) {
      const t = setTimeout(fetchRates, 30_000);
      return () => clearTimeout(t);
    }
  }, [data?.stale, fetchRates]);

  const sortedResults = data?.results
    ? [...data.results].sort((a, b) => {
        if (sortBy === "fee") return a.fee - b.fee;
        if (sortBy === "speed") {
          const toHours = (s) => { const m = s.match(/(\d+)/); return m ? parseInt(m[1]) : 999; };
          return toHours(a.transfer_time) - toHours(b.transfer_time);
        }
        return b.receive_amount - a.receive_amount;
      })
    : [];

  const handleSave = async (quote) => {
    if (!isSignedIn || savedIds.has(quote.provider)) return;
    try {
      const token = await getToken();
      await saveComparison(token, {
        amount: parsedAmount,
        from_currency: from,
        to_currency: to,
        results_json: JSON.stringify(data.results),
      });
      setSavedIds((prev) => new Set([...prev, quote.provider]));
    } catch (err) {
      console.error("Save comparison failed:", err);
    }
  };

  const handleSearch = () => {
    router.push(`/results?from=${fromVal}&to=${toVal}&amount=${amountVal}`);
  };

  const bestQuote = data?.results?.find(q => q.provider === data.best_provider);
  const savingsVsWorst = data?.savings_vs_worst;

  return (
    <>
      <Head>
        <title>{from && to ? `Send ${from} to ${to} — Best Rates | Vaulto` : "Compare Rates — Vaulto"}</title>
        <meta name="description" content={`Compare live money transfer rates for ${from} to ${to}. Find the best exchange rates and lowest fees.`} />
      </Head>

      {/* ── Nav ── */}
      <nav className={`nav ${scrolled ? "scrolled" : ""}`}>
        <div className="container nav-inner">
          <Link href="/" className="logo">
            <span className="logo-mark">V</span>
            Vaulto
          </Link>
          <div className="nav-links">
            <a href="/" className="nav-link">Home</a>
            <a href="/providers" className="nav-link">Providers</a>
            <a href="/about" className="nav-link">About</a>
          </div>
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
            {isLoaded && isSignedIn ? (
              <Link href="/dashboard" className="btn-secondary" style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}>
                Dashboard →
              </Link>
            ) : (
              <Link href="/auth" className="btn-ghost" style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}>
                Log in
              </Link>
            )}
          </div>
        </div>
      </nav>

      <main>
        {/* ── Search bar / corridor header ── */}
        <div className="section-tonal" style={{ padding: "2.5rem 0" }}>
          <div className="container">
            {/* Title */}
            {from && to && (
              <div style={{ marginBottom: "1.5rem" }}>
                <div className="label-sm" style={{ marginBottom: "0.4rem" }}>Live comparison</div>
                <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.8rem", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.03em" }}>
                  Send {from} to {to}
                </h1>
              </div>
            )}

            {/* Search controls */}
            <div className="card" style={{ padding: "1.25rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr 1fr auto", gap: "0.75rem", alignItems: "end" }}>
                <div className="field">
                  <label htmlFor="res-amount">Amount</label>
                  <input id="res-amount" type="number" value={amountVal} onChange={e => setAmountVal(e.target.value)} min="1"
                    style={{ background: "var(--surface-highest)", border: "none", borderRadius: "var(--radius-sm)", padding: "0.7rem 0.9rem", fontSize: "1rem", fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--text)", outline: "none", width: "100%" }} />
                </div>
                <div className="field">
                  <label htmlFor="res-from">From</label>
                  <select id="res-from" value={fromVal} onChange={e => setFromVal(e.target.value)}
                    style={{ background: "var(--surface-highest)", border: "none", borderRadius: "var(--radius-sm)", padding: "0.7rem 0.7rem", fontSize: "0.9rem", fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--text)", cursor: "pointer", outline: "none" }}>
                    {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="res-to">To</label>
                  <select id="res-to" value={toVal} onChange={e => setToVal(e.target.value)}
                    style={{ background: "var(--surface-highest)", border: "none", borderRadius: "var(--radius-sm)", padding: "0.7rem 0.9rem", fontSize: "0.9rem", fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--text)", cursor: "pointer", outline: "none", width: "100%" }}>
                    {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                  <label style={{ fontSize: "0.6875rem", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "transparent" }}>go</label>
                  <button className="btn-secondary" onClick={handleSearch} id="search-rates-btn" style={{ padding: "0.7rem 1.25rem", whiteSpace: "nowrap" }}>
                    Search →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Results ── */}
        <div style={{ padding: "3rem 0 5rem" }}>
          <div className="container">
            {/* Stale warning */}
            {data?.stale && (
              <div className="warn-box" style={{ marginBottom: "1.5rem" }}>
                ⚠️ Rates may be up to 15 minutes old. Refreshing in 30s…
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="loading-box">
                <div className="spinner" />
                Fetching live rates from all providers…
              </div>
            )}

            {/* Error */}
            {error && !loading && (
              <div className="error-box">
                ⚠ {error}
                <button onClick={fetchRates} style={{ marginLeft: "1rem", color: "var(--secondary)", background: "none", border: "none", cursor: "pointer", fontSize: "0.875rem" }}>
                  Try again
                </button>
              </div>
            )}

            {/* No data */}
            {!loading && data?.no_data && (
              <div className="card" style={{ textAlign: "center", padding: "4rem" }}>
                <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>🔍</div>
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", fontWeight: 700, marginBottom: "0.75rem" }}>No rates found</h2>
                <p style={{ color: "var(--muted)", marginBottom: "1.5rem" }}>Try a different currency pair or amount.</p>
                <button className="btn-primary" style={{ margin: "0 auto", width: "auto" }} onClick={() => router.push("/")}>
                  Try different corridor
                </button>
              </div>
            )}

            {!loading && sortedResults.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: "2rem", alignItems: "start" }}>
                {/* Left: results */}
                <div>
                  {/* Best provider banner */}
                  {bestQuote && (
                    <div className="best-card" style={{ marginBottom: "1.5rem" }}>
                      <div>
                        <div className="best-badge">⭐ Best Rate Today</div>
                        <div className="best-provider-name">{bestQuote.provider}</div>
                        <div className="best-meta">
                          <span>Rate: {fmtRate(bestQuote.exchange_rate)}</span>
                          <span>Fee: {bestQuote.fee === 0 ? "Free" : `${bestQuote.currency_from} ${fmt(bestQuote.fee)}`}</span>
                          <span>⏱ {bestQuote.transfer_time}</span>
                        </div>
                        {savingsVsWorst > 0 && (
                          <div className="savings-pill" style={{ marginTop: "1rem" }}>
                            💰 Save up to {bestQuote.currency_to} {fmt(savingsVsWorst)} vs worst option
                          </div>
                        )}
                      </div>
                      <div className="best-receive">
                        <div className="best-receive-label">Recipient gets</div>
                        <div className="best-receive-amount">{fmt(bestQuote.receive_amount)}</div>
                        <div className="best-receive-currency">{bestQuote.currency_to}</div>
                      </div>
                    </div>
                  )}

                  {/* Sort bar */}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
                    <span className="label-sm">Sort by:</span>
                    {[
                      { key: "amount", label: "Best rate" },
                      { key: "fee", label: "Lowest fee" },
                      { key: "speed", label: "Fastest" },
                    ].map(s => (
                      <button
                        key={s.key}
                        onClick={() => setSortBy(s.key)}
                        style={{
                          padding: "0.3rem 0.75rem",
                          borderRadius: "var(--radius-full)",
                          border: "none",
                          fontSize: "0.8rem",
                          fontWeight: 600,
                          cursor: "pointer",
                          fontFamily: "var(--font-body)",
                          background: sortBy === s.key ? "var(--secondary)" : "var(--surface-high)",
                          color: sortBy === s.key ? "white" : "var(--text-mid)",
                          transition: "all 0.15s",
                        }}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>

                  {/* Provider cards */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {sortedResults.map((q, i) => (
                      <ProviderCard
                        key={q.provider}
                        quote={q}
                        rank={i + 1}
                        isBest={q.provider === data.best_provider && sortBy === "amount"}
                        isSignedIn={isLoaded && isSignedIn}
                        saved={savedIds.has(q.provider)}
                        onSave={() => handleSave(q)}
                        onAlert={(quote) => setAlertModal({ open: true, quote })}
                      />
                    ))}
                  </div>

                  <p style={{ color: "var(--muted)", fontSize: "0.72rem", marginTop: "1.5rem", lineHeight: 1.7 }}>
                    Rates are indicative and fetched live. Final amounts may vary based on payment method, recipient bank, and provider terms. Always confirm on the provider's site before transferring.
                  </p>
                </div>

                {/* Right: tips + sign-up CTA */}
                <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", position: "sticky", top: "5rem" }}>
                  {/* Tips */}
                  <div className="card">
                    <h3 style={{ fontFamily: "var(--font-display)", fontSize: "0.95rem", fontWeight: 700, marginBottom: "1.25rem", color: "var(--text)" }}>
                      Expert tips for your corridor
                    </h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                      {TIPS.map(t => (
                        <div key={t.title}>
                          <div style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--text)", marginBottom: "0.25rem" }}>{t.title}</div>
                          <div style={{ fontSize: "0.8rem", color: "var(--text-mid)", lineHeight: 1.6 }}>{t.desc}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Sign-up CTA for guests */}
                  {isLoaded && !isSignedIn && (
                    <div className="card" style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-dim))", position: "relative", overflow: "hidden" }}>
                      <div style={{ position: "absolute", top: 0, right: 0, width: "100px", height: "100px", background: "var(--secondary)", borderRadius: "50%", transform: "translate(30px, -30px)", opacity: 0.15 }} />
                      <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 700, color: "white", marginBottom: "0.6rem" }}>
                        Get rate alerts 🔔
                      </h3>
                      <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.65)", marginBottom: "1.25rem", lineHeight: 1.6 }}>
                        Create a free account and we'll notify you when your rate improves. Save on every transfer.
                      </p>
                      <Link href="/auth?mode=sign-up" className="btn-secondary" id="results-signup-cta" style={{ display: "block", textAlign: "center", textDecoration: "none", borderRadius: "var(--radius-md)", padding: "0.7rem" }}>
                        Sign up free →
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <AlertModal
        isOpen={alertModal.open}
        onClose={() => setAlertModal({ open: false, quote: null })}
        onSuccess={() => {}}
        defaultFrom={alertModal.quote?.currency_from || from}
        defaultTo={alertModal.quote?.currency_to || to}
        defaultAmount={parsedAmount}
        userWhatsapp={user?.phoneNumbers?.[0]?.phoneNumber || null}
      />

      <style jsx>{`
        .prov-card {
          background: var(--surface-float);
          border-radius: var(--radius-lg);
          padding: 1.5rem;
          box-shadow: var(--shadow-sm);
          transition: box-shadow 0.2s, transform 0.15s;
        }
        .prov-card:hover {
          box-shadow: var(--shadow-md);
          transform: translateY(-2px);
        }
        .prov-card-best {
          box-shadow: 0 0 0 2px var(--secondary), var(--shadow-md);
        }
        @media (max-width: 900px) {
          .container > div { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}
