import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth, useUser } from "@clerk/nextjs";
import { getMe, listComparisons, listAlerts, updateAlert } from "../lib/api";
import CompareWidget from "../components/CompareWidget";
import AlertModal from "../components/AlertModal";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function fmtNum(n) {
  return new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}

function Skeleton({ lines = 3 }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="skeleton-line" style={{ width: i % 2 === 0 ? "80%" : "55%", height: "12px" }} />
      ))}
    </div>
  );
}

const NAV_ITEMS = [
  { icon: "⊞", label: "Dashboard", href: "/dashboard", key: "dashboard" },
  { icon: "⇄", label: "Transfers", href: "/results?from=GBP&to=INR&amount=1000", key: "transfers" },
  { icon: "📋", label: "History", href: "/history", key: "history" },
  { icon: "🔔", label: "Alerts", href: "/alerts", key: "alerts" },
  { icon: "📊", label: "Analytics", href: "#", key: "analytics" },
];

export default function Dashboard() {
  const router = useRouter();
  const { isLoaded, isSignedIn, getToken, signOut } = useAuth();
  const { user } = useUser();

  const [profile, setProfile] = useState(null);
  const [comparisons, setComparisons] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingData, setLoadingData] = useState(true);
  const [alertModal, setAlertModal] = useState({ open: false, edit: null });
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Auth guard
  useEffect(() => {
    if (isLoaded && !isSignedIn) router.replace("/auth");
  }, [isLoaded, isSignedIn, router]);

  // Fetch user profile
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    const run = async () => {
      try {
        const token = await getToken();
        const me = await getMe(token);
        setProfile(me);
        if (!me.is_onboarded) router.replace("/onboarding");
      } catch (err) {
        if (err.status === 404) router.replace("/onboarding");
        else setError("Could not load your profile. Please refresh.");
      } finally {
        setLoadingProfile(false);
      }
    };
    run();
  }, [isLoaded, isSignedIn, getToken, router]);

  // Fetch comparisons + alerts
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    const run = async () => {
      try {
        const token = await getToken();
        const [comps, alts] = await Promise.all([
          listComparisons(token, { page: 1, limit: 5 }),
          listAlerts(token),
        ]);
        setComparisons(comps);
        setAlerts(alts);
      } catch (err) {
        console.error("Dashboard data fetch failed:", err);
      } finally {
        setLoadingData(false);
      }
    };
    run();
  }, [isLoaded, isSignedIn, getToken]);

  const handleToggleAlert = async (alert) => {
    try {
      const token = await getToken();
      const updated = await updateAlert(token, alert.id, { is_active: !alert.is_active });
      setAlerts((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    } catch (err) {
      console.error("Toggle alert failed:", err);
    }
  };

  const handleAlertSaved = (saved) => {
    setAlerts((prev) => {
      const existing = prev.findIndex((a) => a.id === saved.id);
      if (existing >= 0) {
        const next = [...prev];
        next[existing] = saved;
        return next;
      }
      return [saved, ...prev];
    });
  };

  const firstName = user?.firstName || user?.username || "there";
  const activeCorridor = profile?.corridor_from && profile?.corridor_to
    ? `${profile.corridor_from} → ${profile.corridor_to}`
    : null;

  if (!isLoaded || loadingProfile) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
        <div className="loading-box"><div className="spinner" />Loading your dashboard…</div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Dashboard — Vaulto | Elite Financial Dashboard</title>
        <meta name="description" content="Your Vaulto dashboard. Compare rates, manage alerts, and track your transfer history." />
      </Head>

      <div className="dash-root">
        {/* ── Sidebar ── */}
        <aside className={`dash-sidebar ${sidebarOpen ? "open" : ""}`}>
          {/* Brand */}
          <div style={{ padding: "1.5rem 1.25rem 2rem" }}>
            <Link href="/" className="logo" style={{ fontSize: "1.2rem" }}>
              <span className="logo-mark" style={{ width: "26px", height: "26px", fontSize: "0.75rem" }}>V</span>
              Vaulto
            </Link>
            <div style={{ marginTop: "0.4rem" }}>
              <span className="pill pill-secondary" style={{ fontSize: "0.6rem" }}>Elite Tier</span>
            </div>
          </div>

          {/* Nav items */}
          <nav style={{ padding: "0 0.75rem", flex: 1 }}>
            {NAV_ITEMS.map(item => (
              <a
                key={item.key}
                href={item.href}
                className={`dash-nav-item ${router.pathname.includes(item.key) ? "active" : ""}`}
                aria-current={router.pathname.includes(item.key) ? "page" : undefined}
              >
                <span style={{ fontSize: "1rem", width: "20px", textAlign: "center" }}>{item.icon}</span>
                {item.label}
              </a>
            ))}
          </nav>

          {/* User section */}
          <div style={{ padding: "1rem 1.25rem", borderTop: "1px solid rgba(11,18,32,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
              <div style={{ width: "36px", height: "36px", background: "linear-gradient(135deg, var(--primary), var(--secondary))", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, color: "white", fontFamily: "var(--font-display)", flexShrink: 0 }}>
                {firstName[0]?.toUpperCase()}
              </div>
              <div style={{ overflow: "hidden" }}>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.875rem", color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{firstName}</div>
                <div style={{ fontSize: "0.7rem", color: "var(--muted)" }}>Verified ✓</div>
              </div>
            </div>
            <button
              className="dash-nav-item"
              onClick={() => signOut()}
              style={{ width: "100%", background: "none", border: "none", cursor: "pointer", color: "var(--muted)", textAlign: "left" }}
            >
              <span style={{ fontSize: "1rem", width: "20px", textAlign: "center" }}>↩</span>
              Logout
            </button>
          </div>
        </aside>

        {/* ── Main content ── */}
        <div className="dash-main-area">
          {/* Mobile header */}
          <div className="dash-mobile-header">
            <button onClick={() => setSidebarOpen(o => !o)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.3rem", color: "var(--text)" }} aria-label="Menu">
              ☰
            </button>
            <Link href="/" className="logo" style={{ fontSize: "1.1rem" }}>
              <span className="logo-mark" style={{ width: "24px", height: "24px", fontSize: "0.7rem" }}>V</span>Vaulto
            </Link>
            <Link href="/alerts" style={{ fontSize: "1.1rem", textDecoration: "none" }}>🔔</Link>
          </div>

          <div className="dash-content">
            {error && <div className="error-box" style={{ marginBottom: "1.5rem" }}>⚠ {error}</div>}

            {/* ── Greeting ── */}
            <div style={{ marginBottom: "2.5rem" }}>
              <div className="label-sm" style={{ marginBottom: "0.4rem" }}>Overview</div>
              <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.6rem, 3vw, 2rem)", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.03em", marginBottom: "0.35rem" }}>
                {greeting()}, {firstName}.
              </h1>
              <p style={{ color: "var(--text-mid)", fontSize: "0.95rem" }}>
                {activeCorridor
                  ? `Your main corridor: ${activeCorridor}. Let's find you the best rate today.`
                  : "Compare rates across all major providers and save on every transfer."}
              </p>
            </div>

            {/* ── Smart Insight Card ── */}
            {activeCorridor && (
              <div style={{ background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-dim) 60%, #1e3460 100%)", borderRadius: "var(--radius-xl)", padding: "2rem", marginBottom: "1.5rem", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: "-20px", right: "-20px", width: "140px", height: "140px", background: "var(--secondary)", borderRadius: "50%", opacity: 0.12 }} />
                <div style={{ position: "absolute", bottom: "-30px", right: "80px", width: "100px", height: "100px", background: "var(--tertiary)", borderRadius: "50%", opacity: 0.08 }} />

                <div className="label-sm" style={{ color: "rgba(255,255,255,0.45)", marginBottom: "0.5rem" }}>
                  Smart Insight — {activeCorridor}
                </div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 700, color: "white", marginBottom: "0.4rem" }}>
                  Your corridor is active
                </div>
                <p style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.6)", maxWidth: "420px", lineHeight: 1.65 }}>
                  Real-time rates are available for your {activeCorridor} corridor. Compare now to find today's best provider.
                </p>
                <Link
                  href={`/results?from=${profile.corridor_from}&to=${profile.corridor_to}&amount=1000`}
                  className="btn-secondary"
                  style={{ display: "inline-flex", marginTop: "1.25rem", textDecoration: "none", padding: "0.65rem 1.25rem", fontSize: "0.875rem" }}
                >
                  Compare now →
                </Link>
              </div>
            )}

            {/* ── Grid layout ── */}
            <div className="dash-grid">
              {/* Compare widget */}
              <div className="card" style={{ gridColumn: "1 / -1" }}>
                <div className="label-sm" style={{ marginBottom: "1rem" }}>Quick compare</div>
                <CompareWidget
                  defaultFrom={profile?.corridor_from || "GBP"}
                  defaultTo={profile?.corridor_to || "INR"}
                  defaultAmount={1000}
                />
              </div>

              {/* Recent activity */}
              <div className="card">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
                  <div className="label-sm">Recent Transfers</div>
                  <Link href="/history" style={{ color: "var(--secondary)", fontSize: "0.8rem", textDecoration: "none", fontWeight: 600 }}>
                    View all →
                  </Link>
                </div>

                {loadingData ? (
                  <Skeleton lines={4} />
                ) : comparisons.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "2rem 0" }}>
                    <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🔍</div>
                    <p style={{ color: "var(--muted)", fontSize: "0.875rem" }}>No transfers yet.<br />Start comparing above!</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                    {comparisons.map((c, i) => {
                      let bestProvider = "—";
                      try {
                        const results = JSON.parse(c.results_json);
                        if (results?.length > 0) bestProvider = results[0].provider;
                      } catch (_) {}
                      return (
                        <a
                          key={c.id}
                          href={`/results?from=${c.from_currency}&to=${c.to_currency}&amount=${c.amount}`}
                          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.9rem 0", textDecoration: "none", borderBottom: i < comparisons.length - 1 ? "1px solid var(--surface-high)" : "none", transition: "opacity 0.15s" }}
                          onMouseEnter={e => e.currentTarget.style.opacity = "0.7"}
                          onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                        >
                          <div>
                            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.9rem", color: "var(--text)", marginBottom: "0.1rem" }}>
                              {c.from_currency} → {c.to_currency}
                            </div>
                            <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>{fmtDate(c.created_at)}</div>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: "0.8rem", color: "var(--text-mid)", fontWeight: 600 }}>{bestProvider}</div>
                            <div style={{ fontSize: "0.72rem", color: "var(--tertiary)" }}>Best price</div>
                          </div>
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Rate alerts */}
              <div className="card">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
                  <div className="label-sm">Rate Alerts</div>
                  <Link href="/alerts" style={{ color: "var(--secondary)", fontSize: "0.8rem", textDecoration: "none", fontWeight: 600 }}>
                    Manage →
                  </Link>
                </div>

                {loadingData ? (
                  <Skeleton lines={3} />
                ) : alerts.filter(a => a.is_active).length === 0 ? (
                  <div style={{ textAlign: "center", padding: "1.5rem 0 0.5rem" }}>
                    <div style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>🔔</div>
                    <p style={{ color: "var(--muted)", fontSize: "0.875rem", marginBottom: "1rem" }}>No active alerts yet.</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                    {alerts.filter(a => a.is_active).slice(0, 4).map((a, i) => (
                      <div key={a.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.85rem 0", borderBottom: i < Math.min(alerts.filter(x => x.is_active).length, 4) - 1 ? "1px solid var(--surface-high)" : "none" }}>
                        <div>
                          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.875rem", color: "var(--text)" }}>
                            {a.from_currency} → {a.to_currency}
                          </div>
                          <div style={{ fontSize: "0.72rem", color: "var(--muted)" }}>Target: {a.target_rate}</div>
                        </div>
                        <button
                          onClick={() => handleToggleAlert(a)}
                          style={{ background: "var(--surface-high)", border: "none", borderRadius: "var(--radius-full)", padding: "0.25rem 0.6rem", fontSize: "0.72rem", color: "var(--muted)", cursor: "pointer", fontWeight: 600 }}
                          title="Pause alert"
                        >
                          Pause
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  className="btn-primary"
                  style={{ width: "100%", marginTop: "1rem", padding: "0.65rem", fontSize: "0.875rem", justifyContent: "center" }}
                  onClick={() => setAlertModal({ open: true, edit: null })}
                >
                  + New Alert
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AlertModal
        isOpen={alertModal.open}
        onClose={() => setAlertModal({ open: false, edit: null })}
        onSuccess={handleAlertSaved}
        defaultFrom={profile?.corridor_from || "GBP"}
        defaultTo={profile?.corridor_to || "INR"}
        defaultAmount={1000}
        editAlert={alertModal.edit}
        userWhatsapp={profile?.whatsapp_number || null}
      />

      <style jsx>{`
        .dash-root {
          display: flex;
          min-height: 100vh;
          background: var(--bg);
        }

        .dash-sidebar {
          width: 240px;
          flex-shrink: 0;
          background: var(--surface-float);
          box-shadow: var(--shadow-md);
          display: flex;
          flex-direction: column;
          position: fixed;
          top: 0;
          left: 0;
          height: 100vh;
          z-index: 50;
          transition: transform 0.25s ease;
        }

        .dash-main-area {
          flex: 1;
          margin-left: 240px;
          display: flex;
          flex-direction: column;
        }

        .dash-mobile-header {
          display: none;
        }

        .dash-content {
          padding: 2.5rem 2rem 4rem;
          max-width: 1000px;
        }

        .dash-nav-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.7rem 0.75rem;
          border-radius: var(--radius-md);
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text-mid);
          text-decoration: none;
          transition: background 0.15s, color 0.15s;
          margin-bottom: 0.15rem;
          font-family: var(--font-body);
        }

        .dash-nav-item:hover {
          background: var(--surface-low);
          color: var(--text);
        }

        .dash-nav-item.active {
          background: var(--secondary-dim);
          color: var(--secondary);
          font-weight: 700;
        }

        .dash-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
        }

        @media (max-width: 900px) {
          .dash-sidebar {
            transform: translateX(-100%);
          }
          .dash-sidebar.open {
            transform: translateX(0);
          }
          .dash-main-area {
            margin-left: 0;
          }
          .dash-mobile-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 1rem 1.25rem;
            background: var(--surface-float);
            box-shadow: var(--shadow-sm);
            position: sticky;
            top: 0;
            z-index: 40;
          }
          .dash-content {
            padding: 1.5rem 1.25rem 3rem;
          }
        }

        @media (max-width: 680px) {
          .dash-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}
