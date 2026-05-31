import Head from "next/head";
import Link from "next/link";
import Nav from "../components/Nav";
import Footer from "../components/Footer";

const DIFFERENTIATORS = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    title: "Real-time rates",
    body: "Every comparison pulls live data from provider APIs. No cached numbers. No estimates. What you see is what you get — right now.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
    title: "Full fee transparency",
    body: "We show transfer fees and exchange-rate margin side by side. The \"no fee\" providers charge you in the spread — we make that visible.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
    title: "Rate alerts",
    body: "Set a target rate for your corridor. We monitor it and notify you by email the moment any provider hits your number.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
        <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
      </svg>
    ),
    title: "Unsponsored rankings",
    body: "Our sort order is purely algorithmic — best rate, lowest fee, or fastest delivery. No provider pays to appear first.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
    title: "Transfer history dashboard",
    body: "Track every comparison you've run. See how rates have moved for your corridor and spot the right moment to send.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: "No conflicts of interest",
    body: "We don't take commission from providers. We don't accept paid placements. Our only incentive is giving you accurate information.",
  },
];

const VALUES = [
  {
    label: "Radical transparency",
    body: "Hidden fees are a design choice — providers hide the markup because they can. We exist to make that markup visible.",
  },
  {
    label: "Accuracy over hype",
    body: "We don't round up numbers or tell you what you want to hear. If the rates are bad today, we'll show you that too.",
  },
  {
    label: "User first",
    body: "We built this for ourselves — international students who got burned by bad transfers. That user is always who we're designing for.",
  },
  {
    label: "Global by design",
    body: "International transfers aren't a niche problem. Hundreds of millions of people send money across borders. Clarity should be the default.",
  },
];

const TEAM = [
  {
    initials: "DR",
    name: "Deepansh Raj Goel",
    role: "Co-founder",
    bio: "Focused on AI automation and vision-based systems. Builds the infrastructure that powers Vaulto's real-time comparison engine.",
  },
  {
    initials: "ST",
    name: "Sarthak Tomar",
    role: "Co-founder",
    bio: "BITS Pilani graduate with startup and consulting experience. Shapes Vaulto's product direction and provider integrations.",
  },
];

const MILESTONES = [
  { marker: "Early 2025", event: "First prototype — AUD→INR corridor, comparing three providers." },
  { marker: "Mid 2025", event: "Rate alerts launched. Users can set a target and get notified by email." },
  { marker: "Late 2025", event: "Transfer history dashboard and user accounts launched." },
  { marker: "2026", event: "Expanding supported corridors and provider coverage." },
];

export default function About() {
  return (
    <>
      <Head>
        <title>About Vaulto — Honest Money Transfer Comparisons</title>
        <meta
          name="description"
          content="Vaulto compares international money transfer providers in real time — with full fee transparency, no sponsored rankings, and no conflicts of interest."
        />
      </Head>
      <Nav variant="light" />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="ab-hero">
        <div className="container">
          <p className="label-sm ab-hero-eyebrow">About Vaulto</p>
          <h1 className="ab-hero-headline">
            Transfer fees have<br />always been hidden.<br />
            <span className="ab-hero-accent">We made them visible.</span>
          </h1>
          <p className="ab-hero-sub">
            Vaulto is a real-time comparison tool for international money transfers.
            We show you the full cost — rate, fee, and margin — so you can decide with complete information.
          </p>
          <div className="ab-hero-actions">
            <Link href="/" className="btn-secondary" id="about-compare-cta">
              Compare rates now →
            </Link>
            <Link href="/auth?mode=signup" className="btn-ghost ab-ghost-light" id="about-signup-cta">
              Create free account
            </Link>
          </div>
        </div>
      </section>

      {/* ── Why Vaulto exists ─────────────────────────────────────────────── */}
      <section className="section">
        <div className="container container-narrow">
          <p className="label-sm" style={{ marginBottom: "0.75rem" }}>Why Vaulto exists</p>
          <h2 className="display-md" style={{ marginBottom: "2rem" }}>
            The problem is by design.
          </h2>
          <div className="ab-story">
            <p>
              Most banks and transfer apps advertise "zero fees." What they don't say is that they
              build their margin into the exchange rate — sometimes 3–5% above the mid-market rate.
              On a $2,000 transfer, that's $60–100 you didn't know you were paying.
            </p>
            <p>
              Vaulto was started by two international students who discovered this the hard way.
              After running the numbers on a few transfers, it was obvious: the only way to make
              a good decision was to compare the <em>total cost</em> — not just the advertised fee.
            </p>
            <p>
              So we built the tool we wished we'd had. It pulls live rates, calculates what you'll
              actually receive, and ranks providers by real value. No fluff. No sponsored results.
            </p>
          </div>
        </div>
      </section>

      {/* ── What makes Vaulto different ───────────────────────────────────── */}
      <section className="section section-tonal">
        <div className="container">
          <p className="label-sm" style={{ textAlign: "center", marginBottom: "0.75rem" }}>
            What makes Vaulto different
          </p>
          <h2 className="display-md" style={{ textAlign: "center", marginBottom: "3rem" }}>
            Built around one principle: honesty.
          </h2>
          <div className="ab-diff-grid">
            {DIFFERENTIATORS.map((d) => (
              <div key={d.title} className="ab-diff-card">
                <div className="ab-diff-icon">{d.icon}</div>
                <h3 className="ab-diff-title">{d.title}</h3>
                <p className="ab-diff-body">{d.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Values ───────────────────────────────────────────────────────── */}
      <section className="section">
        <div className="container container-narrow">
          <p className="label-sm" style={{ marginBottom: "0.75rem" }}>Our principles</p>
          <h2 className="display-md" style={{ marginBottom: "2.5rem" }}>
            What we stand for.
          </h2>
          <div className="ab-values">
            {VALUES.map((v, i) => (
              <div key={v.label} className="ab-value-row">
                <div className="ab-value-num">0{i + 1}</div>
                <div>
                  <div className="ab-value-label">{v.label}</div>
                  <p className="ab-value-body">{v.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Team ─────────────────────────────────────────────────────────── */}
      <section className="section section-tonal">
        <div className="container">
          <p className="label-sm" style={{ textAlign: "center", marginBottom: "0.75rem" }}>The team</p>
          <h2 className="display-md" style={{ textAlign: "center", marginBottom: "0.75rem" }}>
            People you can trust.
          </h2>
          <p className="ab-team-sub">
            Two founders. One focus: make international transfers less opaque.
          </p>
          <div className="ab-team-grid">
            {TEAM.map((m) => (
              <div key={m.name} className="ab-team-card card">
                <div className="ab-team-avatar">{m.initials}</div>
                <h3 className="ab-team-name">{m.name}</h3>
                <p className="ab-team-role">{m.role}</p>
                <p className="ab-team-bio">{m.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Milestones ───────────────────────────────────────────────────── */}
      <section className="section">
        <div className="container container-narrow">
          <p className="label-sm" style={{ marginBottom: "0.75rem" }}>Where we've been</p>
          <h2 className="display-md" style={{ marginBottom: "2.5rem" }}>
            Building in the open.
          </h2>
          <div className="ab-timeline">
            {MILESTONES.map((m, i) => (
              <div key={i} className="ab-tl-item">
                <div className="ab-tl-track">
                  <div className="ab-tl-dot" />
                  {i < MILESTONES.length - 1 && <div className="ab-tl-line" />}
                </div>
                <div className="ab-tl-content">
                  <div className="ab-tl-marker">{m.marker}</div>
                  <p className="ab-tl-event">{m.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="ab-cta">
        <div className="container">
          <div className="ab-cta-inner">
            <div>
              <p className="label-sm ab-cta-eyebrow">Ready to compare?</p>
              <h2 className="ab-cta-headline">
                See the full cost of your next transfer — for free.
              </h2>
              <p className="ab-cta-sub">
                No account required to compare. Create one to save results and set rate alerts.
              </p>
            </div>
            <div className="ab-cta-actions">
              <Link href="/" className="btn-secondary" id="about-cta-compare">
                Compare rates →
              </Link>
              <Link href="/auth?mode=signup" className="ab-cta-ghost" id="about-cta-account">
                Create free account
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      <style jsx>{`
        /* ── Hero ─────────────────────────────────────────────────────── */
        .ab-hero {
          background: linear-gradient(160deg, var(--primary) 0%, #0d1e40 100%);
          padding: 7rem 0 6rem;
          position: relative;
          overflow: hidden;
        }
        .ab-hero::before {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse 70% 60% at 60% 40%, rgba(0,88,190,0.18) 0%, transparent 70%);
          pointer-events: none;
        }
        .ab-hero-eyebrow {
          color: rgba(255,255,255,0.45);
          margin-bottom: 1.25rem;
        }
        .ab-hero-headline {
          font-family: var(--font-display);
          font-size: clamp(2.4rem, 5vw, 3.6rem);
          font-weight: 800;
          line-height: 1.08;
          letter-spacing: -0.04em;
          color: white;
          max-width: 680px;
          margin-bottom: 1.5rem;
        }
        .ab-hero-accent {
          color: var(--secondary);
        }
        .ab-hero-sub {
          color: rgba(255,255,255,0.6);
          font-size: 1.05rem;
          line-height: 1.7;
          max-width: 520px;
          margin-bottom: 2.25rem;
        }
        .ab-hero-actions {
          display: flex;
          gap: 0.875rem;
          flex-wrap: wrap;
          align-items: center;
        }
        .ab-ghost-light {
          color: rgba(255,255,255,0.75);
          border-color: rgba(255,255,255,0.2);
          background: rgba(255,255,255,0.05);
        }
        .ab-ghost-light:hover {
          color: white;
          border-color: rgba(255,255,255,0.5);
          background: rgba(255,255,255,0.1);
        }

        /* ── Story ────────────────────────────────────────────────────── */
        .ab-story {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          color: var(--text-mid);
          font-size: 1rem;
          line-height: 1.8;
        }
        .ab-story em {
          color: var(--text);
          font-style: normal;
          font-weight: 600;
        }

        /* ── Differentiators ──────────────────────────────────────────── */
        .ab-diff-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
        }
        @media (max-width: 900px) { .ab-diff-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 560px) { .ab-diff-grid { grid-template-columns: 1fr; } }

        .ab-diff-card {
          background: var(--surface-float);
          border-radius: var(--radius-lg);
          padding: 1.5rem;
          box-shadow: var(--shadow-sm);
          transition: box-shadow 0.2s, transform 0.15s;
        }
        .ab-diff-card:hover {
          box-shadow: var(--shadow-md);
          transform: translateY(-2px);
        }
        .ab-diff-icon {
          width: 40px;
          height: 40px;
          border-radius: var(--radius-md);
          background: var(--secondary-dim);
          color: var(--secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1rem;
        }
        .ab-diff-title {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 0.95rem;
          color: var(--text);
          margin-bottom: 0.5rem;
        }
        .ab-diff-body {
          font-size: 0.875rem;
          color: var(--text-mid);
          line-height: 1.65;
        }

        /* ── Values ───────────────────────────────────────────────────── */
        .ab-values {
          display: flex;
          flex-direction: column;
          gap: 0;
        }
        .ab-value-row {
          display: grid;
          grid-template-columns: 48px 1fr;
          gap: 1.25rem;
          align-items: start;
          padding: 1.75rem 0;
          border-bottom: 1px solid var(--surface-high);
        }
        .ab-value-row:first-child { border-top: 1px solid var(--surface-high); }
        .ab-value-num {
          font-family: var(--font-display);
          font-weight: 800;
          font-size: 0.8rem;
          color: var(--secondary);
          letter-spacing: 0.02em;
          padding-top: 0.15rem;
        }
        .ab-value-label {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 1.05rem;
          color: var(--text);
          margin-bottom: 0.4rem;
        }
        .ab-value-body {
          font-size: 0.9rem;
          color: var(--text-mid);
          line-height: 1.7;
        }

        /* ── Team ─────────────────────────────────────────────────────── */
        .ab-team-sub {
          text-align: center;
          color: var(--muted);
          font-size: 0.95rem;
          margin-bottom: 3rem;
        }
        .ab-team-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.25rem;
          max-width: 720px;
          margin: 0 auto;
        }
        @media (max-width: 560px) { .ab-team-grid { grid-template-columns: 1fr; } }

        .ab-team-card {
          text-align: center;
          transition: box-shadow 0.2s, transform 0.15s;
        }
        .ab-team-card:hover {
          box-shadow: var(--shadow-md);
          transform: translateY(-2px);
        }
        .ab-team-avatar {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-display);
          font-weight: 800;
          font-size: 1.1rem;
          color: white;
          margin: 0 auto 1rem;
          letter-spacing: 0.02em;
        }
        .ab-team-name {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 1.05rem;
          color: var(--text);
          margin-bottom: 0.2rem;
        }
        .ab-team-role {
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: var(--secondary);
          margin-bottom: 0.875rem;
        }
        .ab-team-bio {
          font-size: 0.875rem;
          color: var(--text-mid);
          line-height: 1.65;
        }

        /* ── Timeline ─────────────────────────────────────────────────── */
        .ab-timeline { display: flex; flex-direction: column; }
        .ab-tl-item {
          display: grid;
          grid-template-columns: 28px 1fr;
          gap: 1.25rem;
          padding-bottom: 2rem;
        }
        .ab-tl-item:last-child { padding-bottom: 0; }
        .ab-tl-track {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding-top: 0.2rem;
        }
        .ab-tl-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: var(--secondary);
          flex-shrink: 0;
        }
        .ab-tl-line {
          width: 2px;
          flex: 1;
          background: var(--surface-high);
          margin-top: 6px;
          min-height: 32px;
        }
        .ab-tl-marker {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 0.8rem;
          color: var(--secondary);
          letter-spacing: 0.01em;
          margin-bottom: 0.3rem;
        }
        .ab-tl-event {
          font-size: 0.925rem;
          color: var(--text-mid);
          line-height: 1.65;
        }

        /* ── CTA ──────────────────────────────────────────────────────── */
        .ab-cta {
          background: linear-gradient(135deg, var(--primary) 0%, #0d1e40 100%);
          padding: 5rem 0;
        }
        .ab-cta-inner {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 3rem;
          align-items: center;
        }
        @media (max-width: 760px) {
          .ab-cta-inner { grid-template-columns: 1fr; gap: 2rem; }
          .ab-cta-actions { flex-direction: row; flex-wrap: wrap; }
        }
        .ab-cta-eyebrow { color: rgba(255,255,255,0.4); margin-bottom: 0.75rem; }
        .ab-cta-headline {
          font-family: var(--font-display);
          font-size: clamp(1.5rem, 3vw, 2rem);
          font-weight: 800;
          letter-spacing: -0.03em;
          color: white;
          line-height: 1.15;
          margin-bottom: 0.75rem;
        }
        .ab-cta-sub {
          font-size: 0.9rem;
          color: rgba(255,255,255,0.5);
          line-height: 1.6;
        }
        .ab-cta-actions {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          flex-shrink: 0;
        }
        .ab-cta-ghost {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          color: rgba(255,255,255,0.65);
          font-family: var(--font-body);
          font-weight: 500;
          font-size: 0.875rem;
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: var(--radius-md);
          padding: 0.65rem 1.25rem;
          text-decoration: none;
          transition: border-color 0.15s, color 0.15s, background 0.15s;
        }
        .ab-cta-ghost:hover {
          color: white;
          border-color: rgba(255,255,255,0.45);
          background: rgba(255,255,255,0.07);
        }

        /* ── Section spacing ──────────────────────────────────────────── */
        .section { padding: 5rem 0; }
        @media (max-width: 700px) { .section { padding: 3.5rem 0; } }
      `}</style>
    </>
  );
}
