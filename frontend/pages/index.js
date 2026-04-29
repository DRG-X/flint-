import Head from "next/head";
import Link from "next/link";
import { useState, useEffect } from "react";

const TESTIMONIALS = [
  {
    quote: "Vaulto saved me over £2,000 in hidden fees last year while paying my offshore developers. I'll never go back to traditional banking comparison sites.",
    name: "Elena Rodriguez",
    title: "Founder at Kinetic Digital",
    avatar: "ER",
  },
  {
    quote: "The real-time comparison is incredible. I found a 0.8% better rate in seconds — that's hundreds of dollars saved on my monthly remittance.",
    name: "Arjun Mehta",
    title: "Software Engineer, London",
    avatar: "AM",
  },
  {
    quote: "As an international student, every rupee counts. Vaulto helps me send money home without losing money on fees I didn't even know existed.",
    name: "Priya Nair",
    title: "MSc Student, University of Manchester",
    avatar: "PN",
  },
];

const FEATURES = [
  {
    icon: "🔍",
    title: "Hidden Fee Detection",
    desc: "Traditional banks hide their fees in the exchange rate. We reveal them with precision-engineered analysis — every markup, every surcharge.",
  },
  {
    icon: "⚡",
    title: "The Fastest Providers",
    desc: "Our algorithm ranks transfers by speed, ensuring your money reaches its destination in minutes, not days. Real-time data, always current.",
  },
  {
    icon: "🛡️",
    title: "Radical Trust",
    desc: "We only surface FCA-regulated and globally licensed entities. Your security is the bedrock of everything we build at Vaulto.",
  },
  {
    icon: "💎",
    title: "True Cost",
    desc: "See the real mid-market rate. No markups, no surprises, just pure financial transparency — so you know exactly what your recipient gets.",
  },
];

const STEPS = [
  {
    num: "01",
    title: "Compare",
    desc: "Enter your amount and currencies. Our engine scans hundreds of data points in milliseconds across all major providers.",
  },
  {
    num: "02",
    title: "Choose",
    desc: "Filter by speed, cost, or rating. We highlight the objective 'Best Match' for your specific needs and corridor.",
  },
  {
    num: "03",
    title: "Save",
    desc: "Redirect securely to your chosen provider. Your savings are locked in instantly. No account required to compare.",
  },
];

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [from, setFrom] = useState("GBP");
  const [to, setTo] = useState("INR");
  const [amount, setAmount] = useState("1000");
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Rotate testimonials
  useEffect(() => {
    const t = setInterval(() => setActiveTestimonial(i => (i + 1) % TESTIMONIALS.length), 5000);
    return () => clearInterval(t);
  }, []);

  const CURRENCIES = ["GBP","USD","EUR","AUD","CAD","SGD","AED","INR","PHP","NGN","PKR","BDT","LKR"];

  return (
    <>
      <Head>
        <title>Vaulto — Real-time International Money Transfer Comparison</title>
        <meta name="description" content="Compare Wise, Remitly, and Western Union live. Find the best exchange rates and lowest fees for international money transfers. Free, instant, unbiased." />
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* ── Glassmorphism Nav ── */}
      <nav className={`nav ${scrolled ? "scrolled" : ""}`} role="navigation">
        <div className="container nav-inner">
          <a href="/" className="logo" aria-label="Vaulto Home">
            <span className="logo-mark">V</span>
            Vaulto
          </a>

          <div className="nav-links" id="main-nav">
            <a href="/results?from=GBP&to=INR&amount=1000" className="nav-link">Transfer</a>
            <Link href="/results?from=GBP&to=INR&amount=1000" className="nav-link">Comparison</Link>
            <a href="#how-it-works" className="nav-link">How it works</a>
            <a href="/about" className="nav-link">About</a>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <Link href="/auth" className="btn-ghost" style={{ padding: "0.55rem 1rem", fontSize: "0.875rem" }}>
              Log in
            </Link>
            <Link href="/auth?mode=sign-up" className="btn-secondary" style={{ padding: "0.55rem 1.1rem", fontSize: "0.875rem" }}>
              Get started →
            </Link>
          </div>
        </div>
      </nav>

      <main>
        {/* ══════════════════════════════════════════════════════════════════
            HERO SECTION
        ══════════════════════════════════════════════════════════════════ */}
        <section className="hero" style={{ paddingTop: "7rem", paddingBottom: "6rem" }}>
          <div className="container" style={{ maxWidth: "900px" }}>
            {/* Eyebrow */}
            <div className="hero-eyebrow anim-fade-up" style={{ marginBottom: "1.5rem" }}>
              Trusted by 50,000+ new users this month
            </div>

            {/* Headline */}
            <h1 className="display-lg anim-fade-up anim-delay-1" style={{ marginBottom: "1.5rem", maxWidth: "700px", margin: "0 auto 1.5rem" }}>
              Real exchange rates.<br />
              <span style={{ background: "linear-gradient(90deg, var(--secondary), var(--tertiary))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Hidden fees, revealed.
              </span>
            </h1>

            {/* Sub */}
            <p className="anim-fade-up anim-delay-2" style={{ fontSize: "1.15rem", color: "var(--text-mid)", maxWidth: "540px", margin: "0 auto 3rem", lineHeight: 1.7 }}>
              We compare Wise, Remitly, and Western Union live — and show you exactly who gives you the most. Free forever. No account required.
            </p>

            {/* Compare Form Card */}
            <div className="card anim-fade-up anim-delay-3" style={{ maxWidth: "640px", margin: "0 auto", padding: "1.5rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr auto", gap: "0.75rem", alignItems: "end", marginBottom: "1rem" }}>
                <div className="field">
                  <label htmlFor="hero-from">You send</label>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <input
                      id="hero-amount"
                      type="number"
                      className="field"
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                      style={{ background: "var(--surface-highest)", border: "none", borderRadius: "var(--radius-sm)", padding: "0.75rem 0.9rem", fontSize: "1rem", color: "var(--text)", fontFamily: "var(--font-display)", fontWeight: 700, flex: 1, outline: "none" }}
                      min="1"
                    />
                    <select
                      id="hero-from"
                      value={from}
                      onChange={e => setFrom(e.target.value)}
                      style={{ background: "var(--surface-highest)", border: "none", borderRadius: "var(--radius-sm)", padding: "0.75rem 0.6rem", fontSize: "0.9rem", color: "var(--text)", fontFamily: "var(--font-display)", fontWeight: 700, cursor: "pointer", outline: "none" }}
                    >
                      {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div style={{ textAlign: "center", paddingBottom: "0.5rem" }}>
                  <span style={{ fontSize: "1.5rem", color: "var(--muted)" }}>→</span>
                </div>

                <div className="field">
                  <label htmlFor="hero-to">Recipient gets</label>
                  <select
                    id="hero-to"
                    value={to}
                    onChange={e => setTo(e.target.value)}
                    style={{ background: "var(--surface-highest)", border: "none", borderRadius: "var(--radius-sm)", padding: "0.75rem 0.9rem", fontSize: "0.9rem", color: "var(--text)", fontFamily: "var(--font-display)", fontWeight: 700, cursor: "pointer", outline: "none", width: "100%" }}
                  >
                    {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div></div>
              </div>

              <Link
                href={`/results?from=${from}&to=${to}&amount=${amount || 1000}`}
                className="btn-secondary"
                id="hero-compare-btn"
                style={{ width: "100%", justifyContent: "center", padding: "0.9rem 1.5rem", fontSize: "1rem", borderRadius: "var(--radius-md)" }}
              >
                Compare live rates →
              </Link>

              <p style={{ textAlign: "center", fontSize: "0.75rem", color: "var(--muted)", marginTop: "0.75rem" }}>
                Estimated based on mid-market rates · Compare top-tier licensed providers
              </p>
            </div>

            {/* Trust badges */}
            <div style={{ display: "flex", justifyContent: "center", gap: "2rem", marginTop: "3rem", flexWrap: "wrap" }}>
              {[
                { icon: "🔒", text: "FCA Regulated Comparison" },
                { icon: "⚡", text: "Real-time rates" },
                { icon: "🆓", text: "Free forever" },
              ].map(b => (
                <div key={b.text} style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.8rem", color: "var(--muted)", fontWeight: 500 }}>
                  <span>{b.icon}</span> {b.text}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            FEATURES — "Why Vaulto"
        ══════════════════════════════════════════════════════════════════ */}
        <section className="section-tonal" style={{ padding: "6rem 0" }}>
          <div className="container">
            <div style={{ textAlign: "center", marginBottom: "4rem" }}>
              <div className="label-sm" style={{ marginBottom: "0.75rem" }}>What makes us different</div>
              <h2 className="display-md">Built on radical transparency</h2>
              <p style={{ color: "var(--text-mid)", fontSize: "1.05rem", maxWidth: "520px", margin: "1rem auto 0", lineHeight: 1.7 }}>
                We've distilled complex global banking into a seamless 3-minute experience.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.25rem" }}>
              {FEATURES.map((f, i) => (
                <div key={f.title} className="card" style={{ animationDelay: `${i * 0.1}s` }}>
                  <div style={{ width: "48px", height: "48px", background: "var(--surface-low)", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", marginBottom: "1.25rem" }}>
                    {f.icon}
                  </div>
                  <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 700, color: "var(--text)", marginBottom: "0.6rem", letterSpacing: "-0.01em" }}>
                    {f.title}
                  </h3>
                  <p style={{ color: "var(--text-mid)", fontSize: "0.9rem", lineHeight: 1.65 }}>
                    {f.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            HOW IT WORKS
        ══════════════════════════════════════════════════════════════════ */}
        <section id="how-it-works" style={{ padding: "7rem 0" }}>
          <div className="container" style={{ maxWidth: "960px" }}>
            <div style={{ textAlign: "center", marginBottom: "5rem" }}>
              <div className="label-sm" style={{ marginBottom: "0.75rem" }}>The process</div>
              <h2 className="display-md">Three steps to a better rate</h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", position: "relative" }}>
              {/* Connector line */}
              <div style={{ position: "absolute", top: "2.5rem", left: "calc(100%/6)", right: "calc(100%/6)", height: "1px", background: "linear-gradient(90deg, transparent, var(--outline), transparent)", zIndex: 0 }} />

              {STEPS.map((s, i) => (
                <div key={s.num} style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
                  <div style={{ width: "48px", height: "48px", background: i === 0 ? "var(--primary)" : "var(--surface-float)", border: i !== 0 ? "2px solid var(--outline)" : "none", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem", fontWeight: 800, color: i === 0 ? "white" : "var(--muted)", margin: "0 auto 1.5rem", fontFamily: "var(--font-display)", boxShadow: i === 0 ? "var(--shadow-float)" : "none" }}>
                    {s.num}
                  </div>
                  <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", fontWeight: 700, color: "var(--text)", marginBottom: "0.6rem", letterSpacing: "-0.02em" }}>
                    {s.title}
                  </h3>
                  <p style={{ fontSize: "0.875rem", color: "var(--text-mid)", lineHeight: 1.7 }}>
                    {s.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            TESTIMONIAL
        ══════════════════════════════════════════════════════════════════ */}
        <section className="section-tonal" style={{ padding: "6rem 0" }}>
          <div className="container" style={{ maxWidth: "800px" }}>
            <div style={{ textAlign: "center", marginBottom: "3rem" }}>
              <div className="label-sm">What people are saying</div>
            </div>

            <div className="card" style={{ padding: "3rem", textAlign: "center", position: "relative", overflow: "hidden" }}>
              {/* Background accent */}
              <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: "200px", height: "2px", background: `linear-gradient(90deg, transparent, var(--secondary), transparent)` }} />

              <div style={{ fontSize: "3rem", color: "var(--secondary)", opacity: 0.2, fontFamily: "Georgia", lineHeight: 1, marginBottom: "1.5rem" }}>"</div>

              <blockquote key={activeTestimonial} style={{ fontSize: "1.1rem", color: "var(--text)", lineHeight: 1.75, fontStyle: "italic", marginBottom: "2rem", animation: "fadeIn 0.4s ease" }}>
                {TESTIMONIALS[activeTestimonial].quote}
              </blockquote>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem" }}>
                <div style={{ width: "40px", height: "40px", background: "linear-gradient(135deg, var(--primary), var(--secondary))", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 700, color: "white", fontFamily: "var(--font-display)" }}>
                  {TESTIMONIALS[activeTestimonial].avatar}
                </div>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.95rem", color: "var(--text)" }}>{TESTIMONIALS[activeTestimonial].name}</div>
                  <div style={{ fontSize: "0.78rem", color: "var(--muted)" }}>{TESTIMONIALS[activeTestimonial].title}</div>
                </div>
              </div>

              {/* Dots */}
              <div style={{ display: "flex", justifyContent: "center", gap: "0.4rem", marginTop: "1.5rem" }}>
                {TESTIMONIALS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveTestimonial(i)}
                    style={{ width: i === activeTestimonial ? "24px" : "8px", height: "8px", borderRadius: "4px", background: i === activeTestimonial ? "var(--secondary)" : "var(--outline)", border: "none", cursor: "pointer", transition: "all 0.3s ease", padding: 0 }}
                    aria-label={`Testimonial ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            CTA BAND
        ══════════════════════════════════════════════════════════════════ */}
        <section style={{ background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-dim) 50%, #1a2845 100%)", padding: "7rem 0", textAlign: "center" }}>
          <div className="container" style={{ maxWidth: "700px" }}>
            <div className="label-sm" style={{ color: "rgba(255,255,255,0.5)", marginBottom: "1.25rem" }}>
              Join the elite tier of global movers
            </div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 800, color: "white", letterSpacing: "-0.04em", marginBottom: "1.25rem", lineHeight: 1.05 }}>
              It takes less than 30 seconds<br />to find a better rate.
            </h2>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "1.05rem", marginBottom: "2.5rem", lineHeight: 1.65 }}>
              Free to use. No credit card required. Compare instantly.
            </p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/results?from=GBP&to=INR&amount=1000" className="btn-secondary" id="cta-compare-btn" style={{ padding: "0.9rem 2rem", fontSize: "1rem" }}>
                Compare rates now →
              </Link>
              <Link href="/auth?mode=sign-up" className="btn-ghost" id="cta-signup-btn" style={{ padding: "0.9rem 2rem", fontSize: "1rem", borderColor: "rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.8)" }}>
                Create free account
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="footer">
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "3rem", marginBottom: "4rem" }}>
            <div>
              <div className="logo" style={{ color: "white", marginBottom: "1rem" }}>
                <span className="logo-mark" style={{ background: "rgba(255,255,255,0.1)" }}>V</span>
                Vaulto
              </div>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.875rem", lineHeight: 1.7, maxWidth: "260px" }}>
                The global standard for transparent currency movement. Compare, choose, and save on every international transfer.
              </p>
            </div>

            {[
              { heading: "Product", links: [["Compare", "/results?from=GBP&to=INR&amount=1000"], ["Browse Providers", "/providers"], ["Live Rates", "/results?from=USD&to=EUR&amount=500"], ["Rate Alerts", "/auth"]] },
              { heading: "Company", links: [["About Us", "/about"], ["How it Works", "#how-it-works"], ["Privacy Policy", "/privacy"], ["Terms of Service", "/terms"]] },
              { heading: "Support", links: [["Contact Us", "/contact"], ["Help Center", "/contact"], ["API Documentation", "#"], ["Cookie Settings", "#"]] },
            ].map(col => (
              <div key={col.heading}>
                <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "1.25rem" }}>
                  {col.heading}
                </div>
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                  {col.links.map(([label, href]) => (
                    <li key={label}>
                      <a href={href} style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.875rem", textDecoration: "none", transition: "color 0.15s" }}
                        onMouseEnter={e => e.target.style.color = "white"}
                        onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.55)"}
                      >
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.8rem" }}>© 2026 Vaulto Global. All rights reserved.</p>
            <div style={{ display: "flex", gap: "1.5rem" }}>
              {["Privacy", "Terms", "Security"].map(l => (
                <a key={l} href="#" style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.8rem", textDecoration: "none" }}>{l}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @media (max-width: 768px) {
          .nav-links { display: none; }
        }
        @media (max-width: 620px) {
          .footer .container > div:first-child { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 480px) {
          .footer .container > div:first-child { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}
