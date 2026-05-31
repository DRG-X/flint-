import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import Nav from "../components/Nav";
import Footer from "../components/Footer";

const REASONS = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    title: "Product Feedback",
    body: "Share ideas, suggestions, or anything that feels confusing.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="6" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
      </svg>
    ),
    title: "Bug Reports",
    body: "Report broken links, incorrect data, or unexpected behavior.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
    title: "Provider Requests",
    body: "Suggest a provider or corridor you want Vaulto to support.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: "Partnerships",
    body: "Reach out for collaborations or business discussions.",
  },
];

const FAQS = [
  {
    q: "Does Vaulto handle money transfers?",
    a: "No. Vaulto compares transfer providers and helps users understand rates, fees, and transfer options. Transfers happen directly through the provider.",
  },
  {
    q: "How often is Vaulto data updated?",
    a: "We aim to keep comparison data as current as possible. Final rates and fees are always set by the provider.",
  },
  {
    q: "Can I request a new provider or corridor?",
    a: "Yes. Send us a message and we'll review it.",
  },
  {
    q: "Can I report incorrect pricing?",
    a: "Absolutely. Send the details and we'll investigate.",
  },
];

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="faq-item">
      <button className="faq-q" onClick={() => setOpen(!open)} id={`faq-${q.substring(0, 20).replace(/\s/g, "-")}`}>
        {q}
        <span className="faq-chevron">{open ? "−" : "+"}</span>
      </button>
      {open && <div className="faq-a">{a}</div>}
      <style jsx>{`
        .faq-item {
          border-bottom: 1px solid var(--surface-high);
        }
        .faq-q {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: none;
          border: none;
          padding: 1.25rem 0;
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 1rem;
          color: var(--text);
          cursor: pointer;
          text-align: left;
          gap: 1rem;
        }
        .faq-q:hover {
          color: var(--secondary);
        }
        .faq-chevron {
          font-size: 1.2rem;
          font-weight: 400;
          flex-shrink: 0;
          color: var(--secondary);
        }
        .faq-a {
          padding-bottom: 1.25rem;
          font-size: 0.875rem;
          color: var(--text-mid);
          line-height: 1.7;
        }
      `}</style>
    </div>
  );
}

export default function Contact() {
  const [copied, setCopied] = useState(false);
  const [bottomCopied, setBottomCopied] = useState(false);

  const handleCopy = (isBottom = false) => {
    navigator.clipboard.writeText("support@vaulto.com");
    if (isBottom) {
      setBottomCopied(true);
      setTimeout(() => setBottomCopied(false), 2000);
    } else {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      <Head>
        <title>Contact Vaulto — Get in touch with us</title>
        <meta
          name="description"
          content="Get in touch with the Vaulto team. Send us your feedback, bug reports, provider requests, or partnership ideas."
        />
      </Head>
      <Nav variant="light" />

      {/* ── 1) Hero Section ───────────────────────────────────────────────── */}
      <section className="contact-hero">
        <div className="container">
          <p className="label-sm contact-hero-eyebrow">CONTACT</p>
          <h1 className="contact-hero-headline">Get in touch with Vaulto</h1>
          <p className="contact-hero-sub">
            Questions, feedback, bug reports, or partnership ideas? Reach out anytime. We usually reply within 1–2 business days.
          </p>
        </div>
      </section>

      {/* ── 2) Main Contact Card Section ──────────────────────────────────── */}
      <section className="contact-card-section">
        <div className="container">
          <div className="contact-card-container">
            <div className="email-card card">
              <div className="email-icon-box">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <p className="label-sm" style={{ color: "var(--secondary)", letterSpacing: "0.06em" }}>Email us</p>
              <a href="mailto:support@vaulto.com" className="email-link" id="contact-email-link">
                support@vaulto.com
              </a>
              <p className="email-helper">This is the best way to reach the Vaulto team.</p>
              <p className="email-reply-time">Typical reply time: 1–2 business days</p>
              <button
                className={`copy-btn ${copied ? "success" : ""}`}
                onClick={() => handleCopy(false)}
                id="contact-copy-btn"
                aria-label="Copy support email address"
              >
                {copied ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                    Copy email
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3) "What can you contact us about?" Section ────────────────── */}
      <section className="reasons-section">
        <div className="container">
          <p className="label-sm" style={{ textAlign: "center", marginBottom: "0.75rem" }}>
            How we can help
          </p>
          <h2 className="display-md" style={{ textAlign: "center", marginBottom: "1rem" }}>
            What you can reach us about
          </h2>
          <p style={{ textAlign: "center", color: "var(--muted)", maxWidth: 520, margin: "0 auto 3rem" }}>
            To help us handle your request quickly, please specify your reason in your email.
          </p>
          <div className="reasons-grid">
            {REASONS.map((r) => (
              <div key={r.title} className="reason-card">
                <div className="reason-icon">{r.icon}</div>
                <div>
                  <h3 className="reason-title">{r.title}</h3>
                  <p className="reason-body">{r.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4) Short FAQ Section ─────────────────────────────────────────── */}
      <section className="faq-section">
        <div className="container container-narrow">
          <p className="label-sm" style={{ textAlign: "center", marginBottom: "0.75rem" }}>
            Common Questions
          </p>
          <h2 className="display-md" style={{ textAlign: "center", marginBottom: "1rem" }}>
            Before you email
          </h2>
          <p style={{ textAlign: "center", color: "var(--muted)", maxWidth: 480, margin: "0 auto 2.5rem" }}>
            Check if your question is answered below. It might save you a message.
          </p>
          <div className="faq-list">
            {FAQS.map((f) => (
              <FAQItem key={f.q} q={f.q} a={f.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ── 5) Optional Team Note Section ────────────────────────────────── */}
      <section className="team-note-section">
        <div className="container">
          <div className="team-note-card">
            <p className="team-note-text">
              “Vaulto is built by student founders from the BITS-RMIT ecosystem who care about making international transfers easier to understand.”
            </p>
          </div>
        </div>
      </section>

      {/* ── 6) Footer CTA Section ────────────────────────────────────────── */}
      <section className="contact-cta">
        <div className="container">
          <div className="contact-cta-inner">
            <div>
              <p className="label-sm contact-cta-eyebrow">Still have questions?</p>
              <h2 className="contact-cta-headline">We're here to help.</h2>
              <p className="contact-cta-sub">
                Drop us a line at support@vaulto.com. We value your feedback and requests.
              </p>
            </div>
            <div className="contact-cta-actions">
              <button
                className={`copy-btn ${bottomCopied ? "success" : ""}`}
                style={{ background: bottomCopied ? "var(--tertiary)" : "rgba(255, 255, 255, 0.1)", border: "1px solid rgba(255, 255, 255, 0.2)" }}
                onClick={() => handleCopy(true)}
                id="contact-bottom-copy-btn"
                aria-label="Copy support email address (footer cta)"
              >
                {bottomCopied ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                    Copy email
                  </>
                )}
              </button>
              <a
                href="mailto:support@vaulto.com"
                className="btn-secondary"
                id="contact-bottom-email-btn"
              >
                Email us
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      <style jsx>{`
        /* ── Contact Hero ─────────────────────────────────────────────── */
        .contact-hero {
          background: linear-gradient(160deg, var(--primary) 0%, #0d1e40 100%);
          padding: 7rem 0 7.5rem;
          position: relative;
          overflow: hidden;
        }
        .contact-hero::before {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse 70% 60% at 60% 40%, rgba(0, 88, 190, 0.18) 0%, transparent 70%);
          pointer-events: none;
        }
        .contact-hero-eyebrow {
          color: rgba(255, 255, 255, 0.45);
          margin-bottom: 1.25rem;
        }
        .contact-hero-headline {
          font-family: var(--font-display);
          font-size: clamp(2.4rem, 5vw, 3.6rem);
          font-weight: 800;
          line-height: 1.08;
          letter-spacing: -0.04em;
          color: white;
          max-width: 680px;
          margin-bottom: 1.5rem;
        }
        .contact-hero-sub {
          color: rgba(255, 255, 255, 0.6);
          font-size: 1.05rem;
          line-height: 1.7;
          max-width: 520px;
          margin-bottom: 0;
        }

        /* ── Contact Main Card ────────────────────────────────────────── */
        .contact-card-section {
          margin-top: -4.5rem;
          position: relative;
          z-index: 10;
          padding-bottom: 4rem;
        }
        .contact-card-container {
          max-width: 600px;
          margin: 0 auto;
        }
        .email-card {
          text-align: center;
          padding: 3.5rem 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          background: var(--surface-float);
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-lg);
          border: 1px solid var(--surface-high);
        }
        .email-icon-box {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: var(--secondary-dim);
          color: var(--secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.25rem;
        }
        .email-link {
          font-family: var(--font-display);
          font-weight: 800;
          font-size: clamp(1.8rem, 4.5vw, 2.5rem);
          color: var(--primary);
          text-decoration: none;
          margin-top: 0.5rem;
          margin-bottom: 0.75rem;
          transition: color 0.15s;
          letter-spacing: -0.02em;
        }
        .email-link:hover {
          color: var(--secondary);
        }
        .email-helper {
          font-size: 0.95rem;
          color: var(--text-mid);
          margin-bottom: 0.35rem;
          font-weight: 500;
        }
        .email-reply-time {
          font-size: 0.8rem;
          color: var(--muted);
          margin-bottom: 2rem;
        }
        .copy-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          background: var(--primary);
          color: white;
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 0.95rem;
          padding: 0.75rem 1.75rem;
          border-radius: var(--radius-md);
          border: none;
          cursor: pointer;
          transition: background 0.15s, transform 0.1s, box-shadow 0.15s;
        }
        .copy-btn:hover {
          background: var(--primary-dim);
          transform: translateY(-1px);
          box-shadow: var(--shadow-sm);
        }
        .copy-btn.success {
          background: var(--tertiary);
        }

        /* ── Reasons Section ──────────────────────────────────────────── */
        .reasons-section {
          padding: 5rem 0;
          background: var(--surface-low);
        }
        .reasons-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
          margin-top: 1rem;
        }
        @media (max-width: 768px) {
          .reasons-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
        }
        .reason-card {
          background: var(--surface-float);
          border-radius: var(--radius-lg);
          padding: 2rem;
          box-shadow: var(--shadow-sm);
          transition: box-shadow 0.2s, transform 0.15s;
          display: flex;
          gap: 1.25rem;
          align-items: start;
        }
        .reason-card:hover {
          box-shadow: var(--shadow-md);
          transform: translateY(-2px);
        }
        .reason-icon {
          width: 44px;
          height: 44px;
          border-radius: var(--radius-md);
          background: var(--secondary-dim);
          color: var(--secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .reason-title {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 1.05rem;
          color: var(--text);
          margin-bottom: 0.5rem;
        }
        .reason-body {
          font-size: 0.9rem;
          color: var(--text-mid);
          line-height: 1.65;
        }

        /* ── FAQ Section ─────────────────────────────────────────────── */
        .faq-section {
          padding: 5rem 0;
        }
        .faq-list {
          margin-top: 2rem;
          border-top: 1px solid var(--surface-high);
        }

        /* ── Team Note Section ────────────────────────────────────────── */
        .team-note-section {
          padding: 2rem 0 4rem;
          background: var(--bg);
        }
        .team-note-card {
          max-width: 720px;
          margin: 0 auto;
          text-align: center;
          padding: 2rem 2.5rem;
          background: var(--surface-low);
          border-radius: var(--radius-lg);
          border: 1px dashed var(--surface-high);
        }
        .team-note-text {
          font-size: 0.95rem;
          color: var(--text-mid);
          line-height: 1.7;
          font-style: italic;
        }

        /* ── Footer CTA Section ───────────────────────────────────────── */
        .contact-cta {
          background: linear-gradient(135deg, var(--primary) 0%, #0d1e40 100%);
          padding: 5rem 0;
        }
        .contact-cta-inner {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 3rem;
          align-items: center;
        }
        @media (max-width: 768px) {
          .contact-cta-inner {
            grid-template-columns: 1fr;
            gap: 2rem;
            text-align: center;
          }
          .contact-cta-actions {
            justify-content: center;
          }
        }
        .contact-cta-eyebrow {
          color: rgba(255, 255, 255, 0.4);
          margin-bottom: 0.75rem;
        }
        .contact-cta-headline {
          font-family: var(--font-display);
          font-size: clamp(1.5rem, 3vw, 2rem);
          font-weight: 800;
          letter-spacing: -0.03em;
          color: white;
          line-height: 1.15;
          margin-bottom: 0.75rem;
        }
        .contact-cta-sub {
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.5);
          line-height: 1.6;
        }
        .contact-cta-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-shrink: 0;
        }
        .contact-cta-actions .copy-btn {
          height: 100%;
        }
      `}</style>
    </>
  );
}
