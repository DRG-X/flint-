import Head from "next/head";
import Link from "next/link";
import Nav from "../components/Nav";
import Footer from "../components/Footer";

const ARTICLES = [
  {
    tag: "Guides",
    title: "The Hidden Cost of International Transfers",
    excerpt: "Your bank says 'no transfer fee' — but charges you 4% in the exchange rate. Here's how to spot hidden markup.",
    readTime: "5 min read",
  },
  {
    tag: "India",
    title: "Best way to send money to India: 2026 Ultimate Guide",
    excerpt: "We compared Wise, Remitly, and Western Union on the GBP→INR and AUD→INR corridors. Results may surprise you.",
    readTime: "8 min read",
  },
  {
    tag: "Tips",
    title: "What is a Bank Transfer Rate and Why It Matters",
    excerpt: "The 'mid-market rate' is the rate banks use with each other. Any markup you pay above it is hidden profit for them.",
    readTime: "4 min read",
  },
  {
    tag: "Regulation",
    title: "LRS Regulations Explained for Indian Students",
    excerpt: "The Liberalised Remittance Scheme allows Indian residents to remit up to USD 250,000 per year. Here's what you need to know.",
    readTime: "6 min read",
  },
  {
    tag: "Market",
    title: "The Best Intelligence",
    excerpt: "Algorithmic currency analysis meets real-world transfer data. We dive into what moves GBP/INR during peak hours.",
    readTime: "7 min read",
  },
  {
    tag: "Strategy",
    title: "Smarter Transfers for Students Abroad",
    excerpt: "Timing, automation, and rate alerts — the three pillars of a smart international payment strategy for students.",
    readTime: "5 min read",
  },
];

export default function Insights() {
  return (
    <>
      <Head>
        <title>Vaulto Insights — International Transfer Guides & Market Analysis</title>
        <meta name="description" content="Learn how to save money on international transfers. Expert guides on exchange rates, hidden fees, and provider comparisons." />
      </Head>
      <Nav variant="light" />

      {/* Hero */}
      <section className="insights-hero">
        <div className="container">
          <p className="label-sm" style={{ color: "rgba(255,255,255,0.6)", marginBottom: "0.75rem" }}>Finance intelligence</p>
          <h1 className="display-md" style={{ color: "white" }}>Vaulto Insights</h1>
          <p style={{ color: "rgba(255,255,255,0.65)", marginTop: "0.75rem", maxWidth: 480 }}>
            The Hidden Cost of International Transfers — and what you can do about it.
          </p>
        </div>
      </section>

      {/* Featured Article */}
      <section className="section">
        <div className="container">
          <p className="label-sm" style={{ marginBottom: "1rem" }}>Featured</p>
          <div className="featured-article card">
            <div className="featured-content">
              <span className="article-tag">Deep Dive</span>
              <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(1.5rem, 3vw, 2rem)", letterSpacing: "-0.03em", margin: "0.75rem 0" }}>
                The Hidden Cost of International Transfers
              </h2>
              <p style={{ color: "var(--text-mid)", lineHeight: 1.7, marginBottom: "1.5rem" }}>
                Every time you send money abroad, there's a hidden fee that doesn't appear on any receipt. It's buried inside the exchange rate — a markup that can cost you 2–5% of your entire transfer. We investigated how banks and traditional providers profit from your lack of information, and how you can fight back.
              </p>
              <div style={{ display: "flex", gap: "1.5rem", color: "var(--muted)", fontSize: "0.8rem", marginBottom: "1.5rem" }}>
                <span>📖 12 min read</span>
                <span>📅 Updated May 2026</span>
              </div>
              <Link href="#" className="btn-secondary">Read full article →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Article Grid */}
      <section className="section section-tonal">
        <div className="container">
          <p className="label-sm" style={{ marginBottom: "1.5rem" }}>Latest articles</p>
          <div className="articles-grid">
            {ARTICLES.map(a => (
              <div key={a.title} className="article-card card">
                <span className="article-tag">{a.tag}</span>
                <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.05rem", margin: "0.75rem 0 0.5rem", letterSpacing: "-0.02em" }}>
                  {a.title}
                </h3>
                <p style={{ fontSize: "0.875rem", color: "var(--text-mid)", lineHeight: 1.6, flex: 1 }}>{a.excerpt}</p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1.25rem" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>{a.readTime}</span>
                  <Link href="#" style={{ color: "var(--secondary)", fontSize: "0.85rem", fontWeight: 600, textDecoration: "none" }}>Read more →</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="insights-cta">
        <div className="container" style={{ textAlign: "center" }}>
          <h2 className="display-md" style={{ color: "white", marginBottom: "1rem" }}>Master your money across borders.</h2>
          <Link href="/auth?mode=signup" className="btn-secondary" id="insights-signup">Start comparing →</Link>
        </div>
      </section>

      <Footer />

      <style jsx>{`
        .insights-hero { background: linear-gradient(135deg, var(--primary), #1e3460); padding: 5rem 0 4rem; }
        .featured-article { display: grid; grid-template-columns: 1fr; }
        .featured-content { padding: 0.5rem 0; }
        .article-tag {
          display: inline-block;
          background: var(--secondary-dim); color: var(--secondary);
          font-size: 0.65rem; font-weight: 700; letter-spacing: 0.08em;
          text-transform: uppercase; padding: 0.2rem 0.65rem;
          border-radius: var(--radius-full);
        }
        .articles-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.25rem; }
        @media (max-width: 900px) { .articles-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 600px) { .articles-grid { grid-template-columns: 1fr; } }
        .article-card { display: flex; flex-direction: column; }
        .insights-cta { background: linear-gradient(135deg, var(--primary), #1e3460); padding: 5rem 0; }
      `}</style>
    </>
  );
}
