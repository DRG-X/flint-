import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import { submitContactForm } from "../lib/api";

const FAQS = [
  { q: "How do I report an issue with a transfer?", a: "Contact us via WhatsApp or email with your Vaulto comparison ID. We'll escalate directly to the provider on your behalf." },
  { q: "Can Vaulto guarantee exchange rates?", a: "Vaulto is a comparison platform — we show live indicative rates. Actual rates are set by each provider at time of transfer." },
  { q: "How do I cancel a transfer?", a: "Cancellations must be processed directly with your provider. Contact us if you need help locating provider support details." },
  { q: "Is my personal data safe?", a: "We never store your financial details. All data is encrypted and we are GDPR compliant. See our Privacy Policy for full details." },
];

const SUBJECTS = ["General inquiry", "Transfer issue", "Rate question", "Technical support", "Feature request", "Partnership"];

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="faq-item">
      <button className="faq-q" onClick={() => setOpen(!open)}>
        {q} <span style={{ color: "var(--secondary)", marginLeft: "auto" }}>{open ? "−" : "+"}</span>
      </button>
      {open && <p className="faq-a">{a}</p>}
      <style jsx>{`
        .faq-item { border-bottom: 1px solid var(--surface-high); }
        .faq-q { width: 100%; display: flex; background: none; border: none; padding: 1.1rem 0; font-family: var(--font-display); font-weight: 600; font-size: 0.95rem; color: var(--text); cursor: pointer; text-align: left; gap: 1rem; }
        .faq-a { padding-bottom: 1.1rem; font-size: 0.875rem; color: var(--text-mid); line-height: 1.7; }
      `}</style>
    </div>
  );
}

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: SUBJECTS[0], message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await submitContactForm(form);
      setSubmitted(true);
    } catch {
      alert("Failed to send. Please email support@vaulto.app directly.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Contact Support — Vaulto</title>
        <meta name="description" content="Get help with international transfers. Contact Vaulto support via email or WhatsApp." />
      </Head>
      <Nav variant="light" />

      {/* Hero */}
      <section className="contact-hero">
        <div className="container" style={{ textAlign: "center" }}>
          <p className="label-sm" style={{ marginBottom: "0.75rem" }}>Support</p>
          <h1 className="display-md">We're here to help you<br />move smarter.</h1>
          <p style={{ color: "var(--muted)", marginTop: "0.75rem", maxWidth: 480, margin: "0.75rem auto 0" }}>
            Our team typically responds within a few hours. We're real people who care about your financial experience.
          </p>
        </div>
      </section>

      <div className="container contact-layout">
        {/* Form */}
        <div className="contact-form-wrap">
          <div className="card">
            <h2 className="headline" style={{ marginBottom: "1.5rem" }}>Send a secure inquiry</h2>
            {submitted ? (
              <div style={{ textAlign: "center", padding: "2.5rem 1rem" }}>
                <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>✅</div>
                <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.2rem" }}>Message received!</h3>
                <p style={{ color: "var(--muted)", marginTop: "0.5rem" }}>We'll get back to you at {form.email} within a few hours.</p>
                <button className="btn-ghost" onClick={() => setSubmitted(false)} style={{ marginTop: "1.5rem" }}>Send another message</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div className="field">
                    <label htmlFor="c-name">Name</label>
                    <input id="c-name" type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Alex Johnson" />
                  </div>
                  <div className="field">
                    <label htmlFor="c-email">Email</label>
                    <input id="c-email" type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="you@example.com" />
                  </div>
                </div>
                <div className="field" style={{ marginTop: "1rem" }}>
                  <label htmlFor="c-subject">Subject</label>
                  <select id="c-subject" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})}>
                    {SUBJECTS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="field" style={{ marginTop: "1rem" }}>
                  <label htmlFor="c-message">Message</label>
                  <textarea id="c-message" required rows={5} value={form.message} onChange={e => setForm({...form, message: e.target.value})} placeholder="Describe your question or issue…" style={{ width: "100%", background: "var(--surface-highest)", border: "none", borderRadius: "var(--radius-sm)", padding: "0.75rem 0.9rem", fontFamily: "var(--font-body)", fontSize: "0.95rem", color: "var(--text)", resize: "vertical", outline: "none" }} />
                </div>
                <button type="submit" className="btn-secondary" style={{ marginTop: "1rem", width: "100%", justifyContent: "center" }} id="contact-submit" disabled={submitting}>
                  {submitting ? "Sending…" : "Send message →"}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Info cards */}
        <div className="contact-info">
          {[
            { icon: "📧", title: "Email support", val: "support@vaulto.app", note: "Response within 4–6 hours" },
            { icon: "💬", title: "WhatsApp support", val: "+44 7700 900000", note: "Mon–Fri, 9am–6pm GMT" },
            { icon: "⏱", title: "Response time", val: "< 4 hours", note: "Average response time" },
          ].map(i => (
            <div key={i.title} className="card-sm contact-info-card">
              <div style={{ fontSize: "1.5rem", marginBottom: "0.75rem" }}>{i.icon}</div>
              <p className="label-sm" style={{ marginBottom: "0.25rem" }}>{i.title}</p>
              <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.95rem" }}>{i.val}</p>
              <p style={{ color: "var(--muted)", fontSize: "0.8rem", marginTop: "0.25rem" }}>{i.note}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <section className="section section-tonal">
        <div className="container container-narrow">
          <p className="label-sm" style={{ textAlign: "center", marginBottom: "0.75rem" }}>FAQ</p>
          <h2 className="display-md" style={{ textAlign: "center", marginBottom: "2.5rem" }}>Common questions</h2>
          {FAQS.map(f => <FAQItem key={f.q} q={f.q} a={f.a} />)}
          <div style={{ textAlign: "center", marginTop: "2rem" }}>
            <Link href="/auth?mode=signup" className="btn-secondary">Create free account →</Link>
          </div>
        </div>
      </section>

      <Footer />

      <style jsx>{`
        .contact-hero { background: var(--surface-low); padding: 5rem 0 3rem; }
        .contact-layout { display: grid; grid-template-columns: 1fr 280px; gap: 2rem; padding: 3rem 1.5rem 5rem; align-items: start; }
        @media (max-width: 900px) { .contact-layout { grid-template-columns: 1fr; } }
        .contact-info { display: flex; flex-direction: column; gap: 1rem; }
        .contact-info-card { display: flex; flex-direction: column; }
      `}</style>
    </>
  );
}
