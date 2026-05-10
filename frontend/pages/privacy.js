import Head from "next/head";
import Link from "next/link";
import Nav from "../components/Nav";
import Footer from "../components/Footer";

export default function PrivacyPolicy() {
  return (
    <>
      <Head>
        <title>Privacy Policy — Vaulto</title>
      </Head>
      <Nav variant="light" />

      <main className="placeholder-main">
        <h1 className="display-md">Privacy Policy</h1>
        <p className="placeholder-body">
          We're working on this. In the meantime, email us at <strong>hello@vaulto.in</strong>
        </p>
        <Link href="/" className="btn-ghost" style={{ background: "var(--surface-float)", border: "1px solid var(--surface-high)" }}>
          ← Back to home
        </Link>
      </main>

      <Footer />

      <style jsx>{`
        .placeholder-main {
          min-height: 65vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 6rem 2rem;
          text-align: center;
          background: var(--bg);
        }
        .display-md {
          font-family: var(--font-display);
          font-weight: 800;
          font-size: 2.5rem;
          color: var(--text);
          margin-bottom: 0.5rem;
        }
        .placeholder-body {
          color: var(--text-mid);
          font-size: 1.1rem;
          margin-bottom: 2rem;
          max-width: 500px;
          line-height: 1.6;
        }
      `}</style>
    </>
  );
}
