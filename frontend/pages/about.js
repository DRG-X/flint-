import Head from "next/head";
import Link from "next/link";
import Nav from "../components/Nav";
import Footer from "../components/Footer";

const VALUES = [
  { icon: "🛡️", title: "Radical Trust", body: "We will never show you a sponsored result or put a provider's interest above yours. Our rankings are purely algorithmic." },
  { icon: "📊", title: "Data Driven", body: "Every comparison is powered by live API data from providers — not cached, not estimated. Real numbers, real time." },
  { icon: "👤", title: "Customer First", body: "We built Vaulto because we were students who lost money on bad transfers. We've never forgotten that feeling." },
  { icon: "🌍", title: "Global by Design", body: "150+ currencies, 200+ countries. We believe financial transparency should be universal, not a first-world privilege." },
];

const TEAM = [
  { name: "Aisha Patel", role: "CEO & Co-founder", bio: "Former Goldman Sachs FX trader. Built Vaulto after losing £800 on a bank transfer she didn't need to." },
  { name: "Marcus Chen", role: "CTO & Co-founder", bio: "Ex-Google engineer. Obsessed with making financial data accessible and actionable for everyday users." },
  { name: "Olivia Santos", role: "Head of Partnerships", bio: "Negotiates directly with providers to ensure Vaulto users always get access to the most competitive rates." },
];

const TIMELINE = [
  { year: "2023", event: "Vaulto founded in Melbourne, Australia. First version compares 3 providers for AUD→INR." },
  { year: "2024", event: "Expanded to 12 corridors, launched rate alerts. Reached 10,000 users." },
  { year: "2025", event: "Partnered with Wise and Remitly APIs. Launched WhatsApp notifications for 20+ countries." },
  { year: "2026", event: "50,000+ monthly users across 40 countries. Saved users over $2M in avoided transfer fees." },
];

export default function About() {
  return (
    <>
      <Head>
        <title>About Vaulto — Transparency for the World's Movers</title>
        <meta name="description" content="Vaulto was built by people who lost money on international transfers and decided to fix the problem. Learn our story." />
      </Head>
      <Nav variant="light" />

      {/* Hero */}
      <section className="about-hero">
        <div className="container">
          <p className="label-sm" style={{ color: "rgba(255,255,255,0.6)", marginBottom: "0.75rem" }}>Our mission</p>
          <h1 className="display-md" style={{ color: "white", maxWidth: 600 }}>
            Transparency for the<br />world's movers.
          </h1>
          <p style={{ color: "rgba(255,255,255,0.65)", maxWidth: 480, marginTop: "1rem" }}>
            Vaulto was built on one radical idea: that you deserve to know exactly how much your money transfer really costs.
          </p>
        </div>
      </section>

      {/* Stats band */}
      <section className="stats-band">
        <div className="container stats-inner">
          {[
            { value: "50K+", label: "Monthly users" },
            { value: "3+", label: "Providers compared" },
            { value: "$700B", label: "Annual remittance industry" },
            { value: "5%", label: "Average savings vs banks" },
          ].map(s => (
            <div key={s.label} className="stat-item">
              <div className="stat-big-val">{s.value}</div>
              <div className="stat-big-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Why Vaulto exists */}
      <section className="section">
        <div className="container container-narrow">
          <p className="label-sm" style={{ marginBottom: "0.75rem" }}>Why Vaulto exists</p>
          <h2 className="display-md" style={{ marginBottom: "1.5rem" }}>Built by movers, for the world.</h2>
          <div className="about-story">
            <p>
              Vaulto was founded in 2023 by two international students who discovered they'd been paying up to 5% above the mid-market rate on every transfer home. The bank said "no fee" — but charged them in the exchange rate.
            </p>
            <p>
              We built a spreadsheet. Then a script. Then a website. Now 50,000 people use Vaulto every month to find the best rate for their specific corridor.
            </p>
            <p>
              We don't take commission from providers. We don't accept sponsored placements. Our business model is built on trust — and helping you keep more of your money.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section section-tonal">
        <div className="container">
          <p className="label-sm" style={{ textAlign: "center", marginBottom: "0.75rem" }}>Our core values</p>
          <h2 className="display-md" style={{ textAlign: "center", marginBottom: "3rem" }}>What we stand for</h2>
          <div className="values-grid">
            {VALUES.map(v => (
              <div key={v.title} className="value-card card-sm">
                <div className="value-icon">{v.icon}</div>
                <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1rem", marginBottom: "0.5rem" }}>{v.title}</h3>
                <p style={{ fontSize: "0.875rem", color: "var(--text-mid)", lineHeight: 1.6 }}>{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="section">
        <div className="container container-narrow">
          <p className="label-sm" style={{ textAlign: "center", marginBottom: "0.75rem" }}>History</p>
          <h2 className="display-md" style={{ textAlign: "center", marginBottom: "3rem" }}>Our journey so far</h2>
          <div className="timeline">
            {TIMELINE.map((t, i) => (
              <div key={t.year} className="tl-item">
                <div className="tl-year">{t.year}</div>
                <div className="tl-line" />
                <div className="tl-event">{t.event}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="section section-tonal">
        <div className="container">
          <p className="label-sm" style={{ textAlign: "center", marginBottom: "0.75rem" }}>The team</p>
          <h2 className="display-md" style={{ textAlign: "center", marginBottom: "3rem" }}>People you can trust</h2>
          <div className="team-grid">
            {TEAM.map(m => (
              <div key={m.name} className="team-card card">
                <div className="team-avatar">{m.name.split(" ").map(n => n[0]).join("")}</div>
                <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.05rem", marginBottom: "0.25rem" }}>{m.name}</h3>
                <p style={{ color: "var(--secondary)", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.75rem" }}>{m.role}</p>
                <p style={{ fontSize: "0.875rem", color: "var(--text-mid)", lineHeight: 1.6 }}>{m.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="about-cta">
        <div className="container" style={{ textAlign: "center" }}>
          <h2 className="display-md" style={{ color: "white", marginBottom: "1rem" }}>Ready to start saving?</h2>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/results?from=AUD&to=INR&amount=1000" className="btn-secondary">Compare rates →</Link>
            <Link href="/auth?mode=signup" className="btn-ghost" style={{ color: "rgba(255,255,255,0.8)", borderColor: "rgba(255,255,255,0.25)" }}>Create free account</Link>
          </div>
        </div>
      </section>

      <Footer />

      <style jsx>{`
        .about-hero { background: linear-gradient(160deg, var(--primary), #1e3460); padding: 6rem 0 5rem; }
        .stats-band { background: var(--surface-low); padding: 2.5rem 0; border-bottom: 1px solid var(--surface-high); }
        .stats-inner { display: grid; grid-template-columns: repeat(4, 1fr); gap: 2rem; }
        @media (max-width: 700px) { .stats-inner { grid-template-columns: repeat(2, 1fr); } }
        .stat-item { text-align: center; }
        .stat-big-val { font-family: var(--font-display); font-size: 2rem; font-weight: 800; letter-spacing: -0.03em; color: var(--text); }
        .stat-big-label { font-size: 0.8rem; color: var(--muted); margin-top: 0.25rem; }
        .about-story { display: flex; flex-direction: column; gap: 1.25rem; color: var(--text-mid); line-height: 1.75; font-size: 1rem; }
        .values-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.25rem; }
        @media (max-width: 900px) { .values-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 500px) { .values-grid { grid-template-columns: 1fr; } }
        .value-card { display: flex; flex-direction: column; gap: 0.5rem; }
        .value-icon { font-size: 1.5rem; width: 44px; height: 44px; background: var(--surface-high); border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; }
        .timeline { display: flex; flex-direction: column; gap: 0; }
        .tl-item { display: grid; grid-template-columns: 80px 40px 1fr; gap: 0; align-items: start; padding-bottom: 2rem; }
        .tl-year { font-family: var(--font-display); font-weight: 800; font-size: 1rem; color: var(--secondary); padding-top: 0.1rem; }
        .tl-line { display: flex; flex-direction: column; align-items: center; gap: 0; }
        .tl-line::before { content: ""; width: 10px; height: 10px; background: var(--secondary); border-radius: 50%; flex-shrink: 0; margin-top: 0.25rem; }
        .tl-line::after { content: ""; width: 2px; flex: 1; background: var(--surface-high); margin-top: 4px; min-height: 40px; }
        .tl-item:last-child .tl-line::after { display: none; }
        .tl-event { font-size: 0.9rem; color: var(--text-mid); line-height: 1.6; padding-top: 0.1rem; }
        .team-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.25rem; }
        @media (max-width: 700px) { .team-grid { grid-template-columns: 1fr; } }
        .team-card { text-align: center; }
        .team-avatar { width: 64px; height: 64px; border-radius: 50%; background: linear-gradient(135deg, var(--secondary), var(--tertiary)); display: flex; align-items: center; justify-content: center; font-family: var(--font-display); font-weight: 800; font-size: 1.2rem; color: white; margin: 0 auto 1rem; }
        .about-cta { background: linear-gradient(135deg, var(--primary), #1e3460); padding: 5rem 0; }
      `}</style>
    </>
  );
}
