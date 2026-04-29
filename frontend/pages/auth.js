import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useSignIn, useSignUp, useUser } from "@clerk/nextjs";

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const BRAND_STATS = [
  { value: "50K+", label: "New users/month" },
  { value: "3+", label: "Providers compared" },
  { value: "5%", label: "Avg. savings" },
];

export default function AuthPage() {
  const router = useRouter();
  const { isLoaded: isSessionLoaded, isSignedIn } = useUser();
  const { isLoaded: isSignInLoaded, signIn, setActive: setSignInActive } = useSignIn();
  const { isLoaded: isSignUpLoaded, signUp, setActive: setSignUpActive } = useSignUp();

  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [forgotSent, setForgotSent] = useState(false);

  // Read ?mode=sign-up from URL
  useEffect(() => {
    if (router.query.mode === "sign-up") setMode("signup");
  }, [router.query.mode]);

  useEffect(() => {
    if (isSessionLoaded && isSignedIn) router.push("/");
  }, [isSessionLoaded, isSignedIn, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) return setError("Please enter your email address");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError("Please enter a valid email address");

    if (mode === "forgot") {
      setLoading(true);
      try {
        if (!isSignInLoaded) return;
        await signIn.create({ strategy: "reset_password_email_code", identifier: email });
        setForgotSent(true);
      } catch (err) {
        setError(err.errors?.[0]?.longMessage || err.message || "Failed to initiate reset.");
      }
      setLoading(false);
      return;
    }

    if (!password) return setError("Please enter your password");
    if (mode === "signup" && password.length < 8) return setError("Password must be at least 8 characters");
    if (mode === "signup" && !name.trim()) return setError("Please enter your name");

    setLoading(true);
    try {
      if (mode === "signup") {
        if (!isSignUpLoaded) return;
        const result = await signUp.create({
          firstName: name.split(" ")[0],
          lastName: name.split(" ").slice(1).join(" "),
          emailAddress: email,
          password,
        });
        if (result.status === "complete") {
          await setSignUpActive({ session: result.createdSessionId });
          router.push("/post-auth");
        } else {
          setError("Verification required — please check your Clerk Dashboard settings.");
        }
      } else {
        if (!isSignInLoaded) return;
        const result = await signIn.create({ identifier: email, password });
        if (result.status === "complete") {
          await setSignInActive({ session: result.createdSessionId });
          router.push("/post-auth");
        }
      }
    } catch (err) {
      console.error(err);
      setError(err.errors?.[0]?.longMessage || err.message || "An authentication error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const opts = { strategy: "oauth_google", redirectUrl: "/sso-callback", redirectUrlComplete: "/post-auth" };
      if (mode === "login" && isSignInLoaded) await signIn.authenticateWithRedirect(opts);
      else if (mode === "signup" && isSignUpLoaded) await signUp.authenticateWithRedirect(opts);
      else setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const switchMode = (m) => { setMode(m); setError(""); setForgotSent(false); };

  return (
    <>
      <Head>
        <title>{mode === "signup" ? "Join Vaulto" : mode === "forgot" ? "Reset Password" : "Log In to Vaulto"} — Elite Access</title>
        <meta name="description" content="Sign in to Vaulto and access your elite financial dashboard." />
      </Head>

      <div className="auth-root">
        {/* ── Left brand panel ── */}
        <div className="auth-brand">
          {/* Decorative orbs */}
          <div className="auth-orb auth-orb-1" />
          <div className="auth-orb auth-orb-2" />
          <div className="auth-orb auth-orb-3" />

          <div className="auth-brand-inner">
            {/* Logo */}
            <a href="/" className="logo" style={{ color: "white" }}>
              <span className="logo-mark" style={{ background: "rgba(255,255,255,0.12)" }}>V</span>
              Vaulto
            </a>

            {/* Headline */}
            <div style={{ marginTop: "auto", paddingBottom: "3rem" }}>
              <div className="label-sm" style={{ color: "rgba(255,255,255,0.4)", marginBottom: "1rem" }}>
                The Kinetic Vault
              </div>
              <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 3.5vw, 2.75rem)", fontWeight: 800, color: "white", letterSpacing: "-0.04em", lineHeight: 1.06, marginBottom: "1.25rem" }}>
                Your money,<br />moving faster<br />than ever.
              </h1>
              <p style={{ fontSize: "0.975rem", color: "rgba(255,255,255,0.55)", lineHeight: 1.7, maxWidth: "340px" }}>
                Experience the fluidity of global finance. Vaulto combines high-security vaulting with the speed of elite trading floors.
              </p>

              {/* Stats */}
              <div style={{ display: "flex", gap: "2rem", marginTop: "3rem" }}>
                {BRAND_STATS.map(s => (
                  <div key={s.value}>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: "1.6rem", fontWeight: 800, color: "white", letterSpacing: "-0.03em" }}>{s.value}</div>
                    <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)", marginTop: "0.15rem" }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Trust badges */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "3rem" }}>
                {[
                  "Real-time rate comparison across 3+ regulated providers",
                  "Smart WhatsApp alerts when rates improve",
                  "Save up to 5% on every international transfer",
                ].map(t => (
                  <div key={t} style={{ display: "flex", alignItems: "center", gap: "0.6rem", fontSize: "0.8rem", color: "rgba(255,255,255,0.5)" }}>
                    <span style={{ width: "16px", height: "16px", background: "rgba(16,185,129,0.25)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.6rem", color: "var(--tertiary)", flexShrink: 0 }}>✓</span>
                    {t}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Right: form panel ── */}
        <div className="auth-form-panel">
          {/* Mobile logo */}
          <div className="auth-mobile-logo">
            <a href="/" className="logo" style={{ fontSize: "1.1rem" }}>
              <span className="logo-mark" style={{ width: "26px", height: "26px", fontSize: "0.75rem" }}>V</span>
              Vaulto
            </a>
          </div>

          <div className="auth-form-inner">
            {/* ─── Login ─── */}
            {mode === "login" && (
              <div key="login" className="anim-fade-up">
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.75rem", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.03em", marginBottom: "0.4rem" }}>
                  Welcome Back
                </h2>
                <p style={{ color: "var(--text-mid)", fontSize: "0.9rem", marginBottom: "2rem" }}>
                  Access your elite financial dashboard.
                </p>

                {/* Google */}
                <button type="button" onClick={handleGoogleAuth} disabled={loading} id="auth-google" className="auth-google-btn">
                  <GoogleIcon />
                  Continue with Google
                </button>

                <div className="auth-divider"><span>or</span></div>

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <div className="auth-field">
                    <label htmlFor="auth-email">Email address</label>
                    <input id="auth-email" type="email" value={email} onChange={e => { setEmail(e.target.value); setError(""); }} placeholder="you@example.com" autoComplete="email" />
                  </div>
                  <div className="auth-field">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <label htmlFor="auth-password">Password</label>
                      <button type="button" onClick={() => switchMode("forgot")} style={{ fontSize: "0.75rem", color: "var(--secondary)", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>
                        Forgot password?
                      </button>
                    </div>
                    <div style={{ position: "relative" }}>
                      <input id="auth-password" type={showPw ? "text" : "password"} value={password} onChange={e => { setPassword(e.target.value); setError(""); }} placeholder="Your password" autoComplete="current-password" style={{ paddingRight: "2.75rem" }} />
                      <button type="button" onClick={() => setShowPw(s => !s)} tabIndex={-1} style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--muted)", fontSize: "1rem" }}>
                        {showPw ? "🙈" : "👁"}
                      </button>
                    </div>
                  </div>

                  {error && <div className="error-box" style={{ margin: 0 }}>⚠ {error}</div>}

                  <button type="submit" disabled={loading} id="auth-login-submit" className="btn-primary" style={{ width: "100%", justifyContent: "center", padding: "0.85rem", fontSize: "0.95rem" }}>
                    {loading ? <div className="spinner" style={{ margin: 0, width: "20px", height: "20px" }} /> : "Sign In →"}
                  </button>
                </form>

                <p style={{ textAlign: "center", fontSize: "0.875rem", color: "var(--text-mid)", marginTop: "1.5rem" }}>
                  Don't have an account?{" "}
                  <button onClick={() => switchMode("signup")} style={{ color: "var(--secondary)", background: "none", border: "none", cursor: "pointer", fontWeight: 700, fontSize: "0.875rem" }}>
                    Sign Up
                  </button>
                </p>
              </div>
            )}

            {/* ─── Sign Up ─── */}
            {mode === "signup" && (
              <div key="signup" className="anim-fade-up">
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.75rem", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.03em", marginBottom: "0.4rem" }}>
                  Join Vaulto
                </h2>
                <p style={{ color: "var(--text-mid)", fontSize: "0.9rem", marginBottom: "2rem" }}>
                  Create your account and start saving on every transfer.
                </p>

                <button type="button" onClick={handleGoogleAuth} disabled={loading} id="signup-google" className="auth-google-btn">
                  <GoogleIcon />
                  Continue with Google
                </button>

                <div className="auth-divider"><span>or</span></div>

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <div className="auth-field">
                    <label htmlFor="signup-name">Full name</label>
                    <input id="signup-name" type="text" value={name} onChange={e => { setName(e.target.value); setError(""); }} placeholder="John Doe" autoComplete="name" autoFocus />
                  </div>
                  <div className="auth-field">
                    <label htmlFor="signup-email">Email address</label>
                    <input id="signup-email" type="email" value={email} onChange={e => { setEmail(e.target.value); setError(""); }} placeholder="you@example.com" autoComplete="email" />
                  </div>
                  <div className="auth-field">
                    <label htmlFor="signup-password">Password</label>
                    <div style={{ position: "relative" }}>
                      <input id="signup-password" type={showPw ? "text" : "password"} value={password} onChange={e => { setPassword(e.target.value); setError(""); }} placeholder="Min. 8 characters" autoComplete="new-password" style={{ paddingRight: "2.75rem" }} />
                      <button type="button" onClick={() => setShowPw(s => !s)} tabIndex={-1} style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--muted)", fontSize: "1rem" }}>
                        {showPw ? "🙈" : "👁"}
                      </button>
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "var(--muted)", marginTop: "0.25rem" }}>
                      Must be at least 8 characters
                    </div>
                  </div>

                  {error && <div className="error-box" style={{ margin: 0 }}>⚠ {error}</div>}

                  <button type="submit" disabled={loading} id="auth-signup-submit" className="btn-primary" style={{ width: "100%", justifyContent: "center", padding: "0.85rem", fontSize: "0.95rem" }}>
                    {loading ? <div className="spinner" style={{ margin: 0, width: "20px", height: "20px" }} /> : "Create Account →"}
                  </button>
                </form>

                <p style={{ textAlign: "center", fontSize: "0.875rem", color: "var(--text-mid)", marginTop: "1.5rem" }}>
                  Already have an account?{" "}
                  <button onClick={() => switchMode("login")} style={{ color: "var(--secondary)", background: "none", border: "none", cursor: "pointer", fontWeight: 700, fontSize: "0.875rem" }}>
                    Sign in
                  </button>
                </p>
              </div>
            )}

            {/* ─── Forgot Password ─── */}
            {mode === "forgot" && (
              <div key="forgot" className="anim-fade-up">
                {!forgotSent ? (
                  <>
                    <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.75rem", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.03em", marginBottom: "0.4rem" }}>
                      Reset Password
                    </h2>
                    <p style={{ color: "var(--text-mid)", fontSize: "0.9rem", marginBottom: "2rem" }}>
                      Enter your email and we'll send a reset link.
                    </p>
                    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                      <div className="auth-field">
                        <label htmlFor="forgot-email">Email address</label>
                        <input id="forgot-email" type="email" value={email} onChange={e => { setEmail(e.target.value); setError(""); }} placeholder="you@example.com" autoFocus />
                      </div>
                      {error && <div className="error-box" style={{ margin: 0 }}>⚠ {error}</div>}
                      <button type="submit" disabled={loading} className="btn-primary" style={{ width: "100%", justifyContent: "center", padding: "0.85rem" }}>
                        {loading ? <div className="spinner" style={{ margin: 0, width: "20px", height: "20px" }} /> : "Send Reset Link →"}
                      </button>
                    </form>
                  </>
                ) : (
                  <div style={{ textAlign: "center" }}>
                    <div style={{ width: "64px", height: "64px", background: "var(--tertiary-dim)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.75rem", margin: "0 auto 1.5rem" }}>✓</div>
                    <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 800, color: "var(--text)", marginBottom: "0.5rem" }}>Check your email</h2>
                    <p style={{ color: "var(--text-mid)", fontSize: "0.875rem" }}>
                      We've sent a reset link to <strong style={{ color: "var(--text)" }}>{email}</strong>
                    </p>
                  </div>
                )}
                <button onClick={() => switchMode("login")} style={{ width: "100%", textAlign: "center", color: "var(--secondary)", fontSize: "0.875rem", fontWeight: 600, background: "none", border: "none", cursor: "pointer", marginTop: "1.5rem" }}>
                  ← Back to sign in
                </button>
              </div>
            )}

            {/* Footer */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem", marginTop: "2.5rem", color: "var(--muted)", fontSize: "0.72rem" }}>
              <span>🔒</span> Your data is encrypted and secure
            </div>
            <div style={{ display: "flex", gap: "1.25rem", justifyContent: "center", marginTop: "1rem" }}>
              {["Privacy", "Terms", "Security"].map(l => <a key={l} href="#" style={{ fontSize: "0.72rem", color: "var(--muted)", textDecoration: "none" }}>{l}</a>)}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .auth-root {
          display: flex;
          min-height: 100vh;
        }

        .auth-brand {
          width: 45%;
          background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dim) 50%, #1a2845 100%);
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
        }

        .auth-brand-inner {
          position: relative;
          z-index: 1;
          padding: 2.5rem;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .auth-orb { position: absolute; border-radius: 50%; }
        .auth-orb-1 { width: 350px; height: 350px; background: var(--secondary); opacity: 0.08; top: -80px; left: -80px; }
        .auth-orb-2 { width: 250px; height: 250px; background: var(--tertiary); opacity: 0.05; bottom: 100px; right: -60px; }
        .auth-orb-3 { width: 180px; height: 180px; background: var(--secondary); opacity: 0.06; bottom: -50px; left: 100px; }

        .auth-form-panel {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem 2rem;
          background: var(--bg);
          position: relative;
        }

        .auth-mobile-logo {
          display: none;
          position: absolute;
          top: 1.5rem;
          left: 1.5rem;
        }

        .auth-form-inner {
          width: 100%;
          max-width: 420px;
        }

        .auth-google-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          background: white;
          border: 1px solid var(--outline);
          border-radius: var(--radius-md);
          padding: 0.75rem 1rem;
          font-family: var(--font-body);
          font-weight: 600;
          font-size: 0.9rem;
          color: var(--text);
          cursor: pointer;
          transition: box-shadow 0.15s, border-color 0.15s;
          box-shadow: var(--shadow-sm);
        }
        .auth-google-btn:hover:not(:disabled) { box-shadow: var(--shadow-md); border-color: var(--outline-strong); }
        .auth-google-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .auth-divider {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin: 1.25rem 0;
          color: var(--muted);
          font-size: 0.75rem;
        }
        .auth-divider::before, .auth-divider::after {
          content: "";
          flex: 1;
          height: 1px;
          background: var(--outline);
        }

        .auth-field {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }
        .auth-field label {
          font-size: 0.6875rem;
          font-weight: 600;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: var(--muted);
        }
        .auth-field input {
          background: var(--surface-highest);
          border: none;
          border-radius: var(--radius-sm);
          color: var(--text);
          font-family: var(--font-body);
          font-size: 0.95rem;
          padding: 0.75rem 0.9rem;
          outline: none;
          width: 100%;
          transition: background 0.15s, box-shadow 0.15s;
        }
        .auth-field input:focus {
          background: var(--surface-float);
          box-shadow: 0 0 0 2px var(--secondary);
        }

        @media (max-width: 768px) {
          .auth-brand { display: none; }
          .auth-mobile-logo { display: flex; }
          .auth-form-panel { justify-content: flex-start; padding-top: 5rem; }
        }
      `}</style>
    </>
  );
}
