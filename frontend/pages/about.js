import Head from "next/head";
import Link from "next/link";
import { useState, useEffect } from "react";

const TIMELINE = [
  { year: "2023", title: "The Problem Identified", desc: "Our founders, frustrated by hidden fees on international student transfers, set out to build a truly transparent comparison engine." },
  { year: "2024", title: "Vaulto Launches", desc: "We launched with Wise, Remitly, and Western Union integrations — fetching live rates rather than relying on stale cached data." },
  { year: "2025", title: "50,000 Users", desc: "Word spread fast. Students, freelancers, and global workers adopted Vaulto as their default comparison tool for every transfer." },
  { year: "2026", title: "AI Rate Intelligence", desc: "We introduced smart rate alerts and predictive corridor analysis — helping users time their transfers for maximum savings." },
];

const TEAM = [
  { name: "Priya Kapoor", role: "Co-Founder & CEO", emoji: "👩‍💼", desc: "Former fintech analyst at Barclays. Born in Mumbai, studied at LSE. Saw the fee problem firsthand." },
  { name: "Marcus Chen", role: "Co-Founder & CTO", emoji: "👨‍💻", desc: "Ex-Wise engineer. Built payment infrastructure for 20+ currencies before starting Vaulto." },
  { name: "Amara Osei", role: "Head of Partnerships", emoji: "🤝", desc: "10 years in cross-border payments. Manages our provider integrations and compliance frameworks." },
];

const VALUES = [
  { icon: "🔍", title: "Radical Transparency", desc: "We show you every fee, every markup, every hidden cost. No financial jargon. Just clear numbers." },
  { icon: "⚡", title: "Speed First", desc: "Our engine fetches live data in real-time. No cached rates, no stale data — only the truth, right now." },
  { icon: "🛡️", title: "Your Security", desc: "We never touch your money. We're purely a comparison engine. Your transfers happen directly with licensed providers." },
  { icon: "🌍", title: "Built for Everyone", desc: "Students, freelancers, remote workers, families — global finance should be accessible to all, not just those with expensive advisors." },
];

export default function About() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <Head>
        <title>About Vaulto — Radical Transparency in Global Finance</title>
        <meta name="description" content="Learn about Vaulto's mission to bring radical transparency to international money transfers. Built by fintech experts, for everyone." />
      </Head>

      {/* Nav */}
      <nav className={`nav ${scrolled ? "scrolled" : ""}`}>
        <div className="container nav-inner">
          <Link href="/" className="logo">
            <span className="logo-mark">V</span>Vaulto
          </Link>
          <div className="nav-links">
            <Link href="/" className="nav-link">Home</Link>
            <Link href="/results?from=GBP&to=INR&amount=1000" className="nav-link">Compare</Link>
            <Link href="/providers" className="nav-link">Providers</Link>
            <Link href="/about" className="nav-link active">About</Link>
          </div>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <Link href="/auth" className="btn-ghost" style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}>Log in</Link>
            <Link href="/auth?mode=sign-up" className="btn-secondary" style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}>Get started →</Link>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero */}
        <section style={{ padding: "7rem 0 6rem", textAlign: "center" }}>
          <div className="container" style={{ maxWidth: "800px" }}>
            <div className="label-sm" style={{ marginBottom: "1rem" }}>Our story</div>
            <h1 className="display-lg" style={{ marginBottom: "1.5rem" }}>
              Built on one radical idea:<br />
              <span style={{ background: "linear-gradient(90deg, var(--secondary), var(--tertiary))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                complete transparency.
              </span>
            </h1>
            <p style={{ fontSize: "1.1rem", color: "var(--text-mid)", lineHeight: 1.75, maxWidth: "600px", margin: "0 auto" }}>
              International money transfer is a $700B industry built on hidden fees and confusing exchange rates. We exist to end that. Vaulto is the global standard for transparent currency movement.
            </p>
          </div>
        </section>

        {/* Stats band */}
        <section className="section-tonal" style={{ padding: "4rem 0" }}>
          <div className="container">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "2rem", textAlign: "center" }}>
              {[
                { value: "50K+", label: "Users this month" },
                { value: "3+", label: "Live providers" },
                { value: "$700B", label: "Industry we're disrupting" },
                { value: "5%", label: "Average savings per transfer" },
              ].map(s => (
                <div key={s.label}>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: "2.5rem", fontWeight: 800, letterSpacing: "-0.04em", color: "var(--primary)", marginBottom: "0.4rem" }}>{s.value}</div>
                  <div style={{ fontSize: "0.875rem", color: "var(--muted)" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Values */}
        <section style={{ padding: "6rem 0" }}>
          <div className="container">
            <div style={{ textAlign: "center", marginBottom: "4rem" }}>
              <div className="label-sm" style={{ marginBottom: "0.75rem" }}>What drives us</div>
              <h2 className="display-md">Our principles</h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.25rem" }}>
              {VALUES.map(v => (
                <div key={v.title} className="card">
                  <div style={{ width: "48px", height: "48px", background: "var(--surface-low)", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", marginBottom: "1.25rem" }}>{v.icon}</div>
                  <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.6rem", letterSpacing: "-0.01em" }}>{v.title}</h3>
                  <p style={{ color: "var(--text-mid)", fontSize: "0.9rem", lineHeight: 1.65 }}>{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="section-tonal" style={{ padding: "6rem 0" }}>
          <div className="container" style={{ maxWidth: "800px" }}>
            <div style={{ textAlign: "center", marginBottom: "4rem" }}>
              <div className="label-sm" style={{ marginBottom: "0.75rem" }}>History</div>
              <h2 className="display-md">The Vaulto Story</h2>
            </div>
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", left: "80px", top: 0, bottom: 0, width: "1px", background: "var(--outline)" }} />
              <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
                {TIMELINE.map((t, i) => (
                  <div key={t.year} style={{ display: "flex", gap: "2rem", alignItems: "flex-start" }}>
                    <div style={{ width: "80px", flexShrink: 0, textAlign: "right" }}>
                      <span style={{ fontFamily: "var(--font-display)", fontSize: "0.875rem", fontWeight: 800, color: i === TIMELINE.length - 1 ? "var(--secondary)" : "var(--muted)" }}>{t.year}</span>
                    </div>
                    <div style={{ width: "12px", height: "12px", background: i === TIMELINE.length - 1 ? "var(--secondary)" : "var(--surface-float)", border: "2px solid " + (i === TIMELINE.length - 1 ? "var(--secondary)" : "var(--outline)"), borderRadius: "50%", flexShrink: 0, marginTop: "0.15rem", position: "relative", zIndex: 1, boxShadow: i === TIMELINE.length - 1 ? "0 0 0 4px var(--secondary-dim)" : "none" }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1rem", marginBottom: "0.4rem", color: "var(--text)" }}>{t.title}</div>
                      <div style={{ fontSize: "0.875rem", color: "var(--text-mid)", lineHeight: 1.65 }}>{t.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Team */}
        <section style={{ padding: "6rem 0" }}>
          <div className="container">
            <div style={{ textAlign: "center", marginBottom: "4rem" }}>
              <div className="label-sm" style={{ marginBottom: "0.75rem" }}>The people</div>
              <h2 className="display-md">Meet the team</h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.25rem" }}>
              {TEAM.map(m => (
                <div key={m.name} className="card" style={{ textAlign: "center" }}>
                  <div style={{ width: "72px", height: "72px", background: "linear-gradient(135deg, var(--primary), var(--secondary))", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", margin: "0 auto 1.25rem" }}>
                    {m.emoji}
                  </div>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1rem", marginBottom: "0.2rem" }}>{m.name}</div>
                  <div className="label-sm" style={{ marginBottom: "0.75rem" }}>{m.role}</div>
                  <p style={{ fontSize: "0.875rem", color: "var(--text-mid)", lineHeight: 1.6 }}>{m.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-dim))", padding: "6rem 0", textAlign: "center" }}>
          <div className="container" style={{ maxWidth: "600px" }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "2.25rem", fontWeight: 800, color: "white", letterSpacing: "-0.04em", marginBottom: "1rem" }}>
              Join us in fixing global finance.
            </h2>
            <p style={{ color: "rgba(255,255,255,0.6)", marginBottom: "2.5rem", lineHeight: 1.7 }}>
              Free to use. No account needed to compare rates. Start saving in 30 seconds.
            </p>
            <Link href="/results?from=GBP&to=INR&amount=1000" className="btn-secondary" style={{ padding: "0.9rem 2rem", fontSize: "1rem" }}>
              Compare rates now →
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="container" style={{ textAlign: "center" }}>
          <div className="logo" style={{ color: "white", marginBottom: "1rem", justifyContent: "center" }}>
            <span className="logo-mark" style={{ background: "rgba(255,255,255,0.1)" }}>V</span>Vaulto
          </div>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.8rem", marginTop: "0.5rem" }}>© 2026 Vaulto Global. All rights reserved.</p>
          <div style={{ display: "flex", gap: "1.5rem", justifyContent: "center", marginTop: "1rem" }}>
            {["Home", "Compare", "Providers", "Privacy", "Terms"].map(l => (
              <a key={l} href={l === "Home" ? "/" : l === "Compare" ? "/results?from=GBP&to=INR&amount=1000" : l === "Providers" ? "/providers" : "#"} style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.8rem", textDecoration: "none" }}>{l}</a>
            ))}
          </div>
        </div>
      </footer>

      <style jsx>{`
        @media (max-width: 768px) {
          .nav-links { display: none; }
        }
        @media (max-width: 600px) {
          section > .container > div { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 480px) {
          section > .container > div[style*="repeat(3"] { grid-template-columns: 1fr !important; }
          section > .container > div[style*="repeat(4"] { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </>
  );
}
