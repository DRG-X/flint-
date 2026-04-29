import Head from "next/head";
import Link from "next/link";
import { useState, useEffect } from "react";

const PROVIDERS = [
  {
    id: "wise",
    name: "Wise",
    tagline: "The mid-market rate, always.",
    description: "Wise (formerly TransferWise) uses the real mid-market exchange rate with transparent, low fees. No hidden costs — you see exactly what your recipient gets before you send.",
    emoji: "🔵",
    accentColor: "#00B9A8",
    features: ["Mid-market rate", "Low transparent fees", "Multi-currency accounts", "Batch payments"],
    strengths: ["Best for regular transfers", "Excellent for GBP, EUR, USD corridors", "Supports 80+ currencies"],
    avgFee: "0.4%–1.5%",
    speed: "Instant – 2 days",
    regulated: "FCA (UK), FinCEN (US), ASIC (AU)",
    website: "https://wise.com",
  },
  {
    id: "remitly",
    name: "Remitly",
    tagline: "Built for global families.",
    description: "Remitly specializes in sending money to family in developing countries. It offers two options per corridor — Economy (low fee, slower) and Express (instant, higher fee) — so you can choose your priority.",
    emoji: "🟠",
    accentColor: "#FF6B2B",
    features: ["Economy & Express options", "Mobile wallet delivery", "Cash pickup network", "Guaranteed delivery times"],
    strengths: ["Best for South Asia (INR, PKR, BDT)", "Strong Philippines, Africa corridors", "Excellent mobile app"],
    avgFee: "1%–3%",
    speed: "Minutes – 3 days",
    regulated: "FinCEN (US), FCA (UK)",
    website: "https://remitly.com",
  },
  {
    id: "western-union",
    name: "Western Union",
    tagline: "The global network.",
    description: "Western Union has the world's largest agent network — 500,000+ locations in 200+ countries. Best when your recipient needs cash pickup rather than a bank transfer.",
    emoji: "🟡",
    accentColor: "#FFCC00",
    features: ["500K+ agent locations", "Cash pickup globally", "Bank transfers & mobile wallets", "Established since 1851"],
    strengths: ["Unmatched cash pickup network", "Ideal for remote/rural recipients", "Wide corridor coverage"],
    avgFee: "1.5%–5%",
    speed: "Minutes (cash) — 1-5 days (bank)",
    regulated: "FinCEN (US), FCA (UK), regulated in 200+ countries",
    website: "https://westernunion.com",
  },
];

const FAQ = [
  { q: "How do you fetch live rates?", a: "We call each provider's live pricing API directly — no cached data, no stale rates. Every time you compare, we fetch in real-time." },
  { q: "Do you earn commission from providers?", a: "No. Vaulto is completely independent. We never receive referral fees or commissions that would affect our rankings. Your best rate is always shown first." },
  { q: "Why are rates sometimes different from the provider's website?", a: "Rates can fluctuate in seconds. There may also be small differences based on payment method (bank transfer vs card). Our rates reflect the standard bank transfer rate." },
  { q: "How often are rates updated?", a: "Every time you hit 'Compare'. We fetch live at the moment of your query, ensuring you always see current pricing." },
];

export default function Providers() {
  const [scrolled, setScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <Head>
        <title>Browse Providers — Wise, Remitly, Western Union | Vaulto</title>
        <meta name="description" content="Compare Wise, Remitly, and Western Union. Understand each provider's strengths, fees, speed, and best use cases for international money transfers." />
      </Head>

      {/* Nav */}
      <nav className={`nav ${scrolled ? "scrolled" : ""}`}>
        <div className="container nav-inner">
          <Link href="/" className="logo"><span className="logo-mark">V</span>Vaulto</Link>
          <div className="nav-links">
            <Link href="/" className="nav-link">Home</Link>
            <Link href="/results?from=GBP&to=INR&amount=1000" className="nav-link">Compare</Link>
            <Link href="/providers" className="nav-link active">Providers</Link>
            <Link href="/about" className="nav-link">About</Link>
          </div>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <Link href="/auth" className="btn-ghost" style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}>Log in</Link>
            <Link href="/auth?mode=sign-up" className="btn-secondary" style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}>Get started →</Link>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero */}
        <section style={{ padding: "6rem 0 4rem", textAlign: "center" }}>
          <div className="container" style={{ maxWidth: "700px" }}>
            <div className="label-sm" style={{ marginBottom: "1rem" }}>The providers we compare</div>
            <h1 className="display-lg" style={{ marginBottom: "1.25rem" }}>Know your options.<br />Choose with confidence.</h1>
            <p style={{ fontSize: "1.05rem", color: "var(--text-mid)", lineHeight: 1.75 }}>
              We compare the world's top regulated transfer providers — Wise, Remitly, and Western Union — live, in real-time, with zero bias.
            </p>
          </div>
        </section>

        {/* Provider cards */}
        <section className="section-tonal" style={{ padding: "4rem 0" }}>
          <div className="container">
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {PROVIDERS.map((p, i) => (
                <div key={p.id} className="card" style={{ padding: "2.5rem", overflow: "hidden", position: "relative" }}>
                  {/* Accent bar */}
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: p.accentColor }} />

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem", alignItems: "start" }}>
                    {/* Left */}
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.25rem" }}>
                        <div style={{ width: "52px", height: "52px", background: "var(--surface-low)", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.75rem" }}>
                          {p.emoji}
                        </div>
                        <div>
                          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 800, letterSpacing: "-0.02em", color: "var(--text)" }}>{p.name}</h2>
                          <div style={{ fontSize: "0.8rem", color: "var(--muted)", fontStyle: "italic" }}>{p.tagline}</div>
                        </div>
                      </div>

                      <p style={{ color: "var(--text-mid)", fontSize: "0.925rem", lineHeight: 1.7, marginBottom: "1.5rem" }}>{p.description}</p>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
                        {[
                          { label: "Average Fee", value: p.avgFee },
                          { label: "Delivery Speed", value: p.speed },
                        ].map(m => (
                          <div key={m.label} className="card-sm" style={{ background: "var(--surface-low)" }}>
                            <div className="label-sm" style={{ marginBottom: "0.3rem" }}>{m.label}</div>
                            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.95rem", color: "var(--text)" }}>{m.value}</div>
                          </div>
                        ))}
                      </div>

                      <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: "1.25rem" }}>
                        <span style={{ fontWeight: 600 }}>Regulated by: </span>{p.regulated}
                      </div>

                      <div style={{ display: "flex", gap: "0.75rem" }}>
                        <Link
                          href={`/results?from=GBP&to=INR&amount=1000`}
                          className="btn-primary"
                          id={`compare-${p.id}`}
                          style={{ fontSize: "0.875rem", padding: "0.6rem 1.1rem" }}
                        >
                          Compare {p.name} →
                        </Link>
                        <a href={p.website} target="_blank" rel="noopener noreferrer" className="btn-ghost" style={{ fontSize: "0.875rem", padding: "0.6rem 1rem" }}>
                          Visit site ↗
                        </a>
                      </div>
                    </div>

                    {/* Right */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                      <div>
                        <div className="label-sm" style={{ marginBottom: "0.75rem" }}>Key features</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                          {p.features.map(f => (
                            <div key={f} style={{ display: "flex", alignItems: "center", gap: "0.6rem", fontSize: "0.875rem", color: "var(--text-mid)" }}>
                              <span style={{ width: "18px", height: "18px", background: "var(--secondary-dim)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.6rem", color: "var(--secondary)", flexShrink: 0, fontWeight: 700 }}>✓</span>
                              {f}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="label-sm" style={{ marginBottom: "0.75rem" }}>Best for</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                          {p.strengths.map(s => (
                            <div key={s} style={{ display: "flex", alignItems: "center", gap: "0.6rem", fontSize: "0.875rem", color: "var(--text-mid)" }}>
                              <span style={{ color: "var(--tertiary)", fontSize: "0.75rem" }}>★</span>
                              {s}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section style={{ padding: "6rem 0" }}>
          <div className="container" style={{ maxWidth: "720px" }}>
            <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
              <div className="label-sm" style={{ marginBottom: "0.75rem" }}>Common questions</div>
              <h2 className="display-md">How our comparison works</h2>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {FAQ.map((f, i) => (
                <div
                  key={i}
                  className="card"
                  style={{ padding: "1.25rem 1.5rem", cursor: "pointer", transition: "box-shadow 0.2s" }}
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.95rem", color: "var(--text)" }}>{f.q}</div>
                    <span style={{ color: "var(--muted)", fontSize: "1.1rem", transition: "transform 0.2s", transform: openFaq === i ? "rotate(45deg)" : "none" }}>+</span>
                  </div>
                  {openFaq === i && (
                    <div style={{ marginTop: "0.75rem", fontSize: "0.875rem", color: "var(--text-mid)", lineHeight: 1.7, borderTop: "1px solid var(--surface-high)", paddingTop: "0.75rem" }}>
                      {f.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-dim))", padding: "6rem 0", textAlign: "center" }}>
          <div className="container" style={{ maxWidth: "580px" }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 800, color: "white", letterSpacing: "-0.03em", marginBottom: "1rem" }}>
              Ready to compare live?
            </h2>
            <p style={{ color: "rgba(255,255,255,0.6)", marginBottom: "2rem" }}>
              Enter your amount and corridor — we'll fetch live rates from all three providers instantly.
            </p>
            <Link href="/results?from=GBP&to=INR&amount=1000" className="btn-secondary" id="providers-cta" style={{ padding: "0.9rem 2rem", fontSize: "1rem" }}>
              Compare rates now →
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="container" style={{ textAlign: "center" }}>
          <div className="logo" style={{ color: "white", marginBottom: "0.75rem", justifyContent: "center" }}>
            <span className="logo-mark" style={{ background: "rgba(255,255,255,0.1)" }}>V</span>Vaulto
          </div>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.8rem" }}>© 2026 Vaulto Global. All rights reserved.</p>
        </div>
      </footer>

      <style jsx>{`
        @media (max-width: 768px) {
          .nav-links { display: none; }
        }
        @media (max-width: 680px) {
          .card > div { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}
