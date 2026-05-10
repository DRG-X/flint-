import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-brand">
            <Link href="/" className="logo footer-logo">
              <span className="logo-mark">V</span>
              <span>Vaulto</span>
            </Link>
            <p className="footer-tagline">
              Real exchange rates. Hidden fees, revealed. We compare Wise, Remitly, and Western Union live.
            </p>
            <div className="footer-badges">
              <span className="f-badge">🔒 FCA Regulated</span>
              <span className="f-badge">⚡ Real-time</span>
            </div>
          </div>

          {/* Product */}
          <div className="footer-col">
            <h4 className="footer-heading">Product</h4>
            <ul className="footer-links">
              <li><Link href="/results?from=GBP&to=INR&amount=1000">Compare Rates</Link></li>
              <li><Link href="/providers">Browse Providers</Link></li>
              <li><Link href="/alerts">Rate Alerts</Link></li>
              <li><Link href="/insights">Insights</Link></li>
              <li><Link href="/send">Send Money</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div className="footer-col">
            <h4 className="footer-heading">Company</h4>
            <ul className="footer-links">
              <li><Link href="/about">About Vaulto</Link></li>
              <li><Link href="/contact">Contact</Link></li>
              <li><Link href="/insights">Blog</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div className="footer-col">
            <h4 className="footer-heading">Support</h4>
            <ul className="footer-links">
              <li><Link href="/contact">Help Center</Link></li>
              <li><Link href="/contact">WhatsApp Support</Link></li>
              <li><a href="mailto:support@vaulto.app">support@vaulto.app</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {currentYear} Vaulto. All rights reserved. Rates are indicative only.</p>
          <div className="footer-legal">
            <Link href="#">Privacy Policy</Link>
            <Link href="#">Terms of Service</Link>
            <Link href="#">Cookie Policy</Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        .footer-logo { color: white !important; margin-bottom: 1rem; }
        .footer-tagline {
          color: rgba(255,255,255,0.5);
          font-size: 0.875rem;
          line-height: 1.6;
          margin-bottom: 1rem;
          max-width: 240px;
        }
        .footer-badges { display: flex; flex-wrap: wrap; gap: 0.5rem; }
        .f-badge {
          font-size: 0.7rem;
          background: rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.6);
          padding: 0.25rem 0.6rem;
          border-radius: var(--radius-full);
          border: 1px solid rgba(255,255,255,0.1);
        }

        .footer-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 3rem;
          padding-bottom: 3rem;
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }
        @media (max-width: 900px) {
          .footer-grid { grid-template-columns: 1fr 1fr; gap: 2rem; }
        }
        @media (max-width: 500px) {
          .footer-grid { grid-template-columns: 1fr; gap: 1.5rem; }
        }

        .footer-heading {
          font-family: var(--font-display);
          font-size: 0.8rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.9);
          margin-bottom: 1rem;
        }
        .footer-links { list-style: none; display: flex; flex-direction: column; gap: 0.6rem; }
        .footer-links a {
          color: rgba(255,255,255,0.5);
          text-decoration: none;
          font-size: 0.875rem;
          transition: color 0.15s;
        }
        .footer-links a:hover { color: rgba(255,255,255,0.9); }

        .footer-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .footer-bottom p { color: rgba(255,255,255,0.35); font-size: 0.8rem; }
        .footer-legal { display: flex; gap: 1.5rem; }
        .footer-legal a {
          color: rgba(255,255,255,0.35);
          font-size: 0.8rem;
          text-decoration: none;
          transition: color 0.15s;
        }
        .footer-legal a:hover { color: rgba(255,255,255,0.7); }
      `}</style>
    </footer>
  );
}
