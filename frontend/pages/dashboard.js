import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth, useUser, useClerk } from "@clerk/nextjs";
import Head from "next/head";
import Link from "next/link";
import CompareWidget from "../components/CompareWidget";
import AlertModal from "../components/AlertModal";
import { getMe, listComparisons, listAlerts, syncUser } from "../lib/api";
import { isAdmin } from "../lib/admin";

// ── FIX 1: Added missing icons for History ("📋") and Alerts ("🔔") ──────────
const NAV_ITEMS = [
  { key: "dashboard", href: "/dashboard", icon: "⊞", label: "Dashboard" },
  { key: "transfers", href: "/results?from=GBP&to=INR&amount=1000", icon: "⇄", label: "Transfers" },
  { key: "history", href: "/history", icon: "📋", label: "History" },
  { key: "alerts", href: "/alerts", icon: "🔔", label: "Alerts" },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default function Dashboard() {
  const router = useRouter();
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { user } = useUser();
  const { signOut } = useClerk();

  const [profile, setProfile] = useState(null);
  const [comparisons, setComparisons] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [alertModalOpen, setAlertModalOpen] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) { router.replace("/auth"); return; }

    const load = async () => {
      try {
        const syncToken = await getToken();
        await syncUser(syncToken, {
          clerk_id: user?.id || "",
          email: user?.primaryEmailAddress?.emailAddress || "",
          full_name: user?.fullName || user?.username || "",
        });
      } catch (_) { }

      setLoading(true);
      try {
        const token = await getToken();
        const [meResult, compsResult, altsResult] = await Promise.allSettled([
          getMe(token),
          listComparisons(token, { page: 1, limit: 5 }),
          listAlerts(token),
        ]);

        const me = meResult.status === "fulfilled" ? meResult.value : null;
        const comps = compsResult.status === "fulfilled" ? compsResult.value : [];
        const alts = altsResult.status === "fulfilled" ? altsResult.value : [];

        if (!me) {
          const err = meResult.reason || {};
          if (err.status === 404) { router.replace("/onboarding"); }
          else if (err.status === 401) { router.replace("/auth"); }
          else { setError("Could not load your profile. Refresh to try again."); }
          setLoading(false);
          return;
        }
        if (!me.is_onboarded) { router.replace("/onboarding"); return; }

        setProfile(me);
        setComparisons(Array.isArray(comps) ? comps : []);
        setAlerts(Array.isArray(alts) ? alts : []);

        const compsErr = compsResult.status === "rejected" ? compsResult.reason : null;
        const altsErr = altsResult.status === "rejected" ? altsResult.reason : null;
        if ((compsErr && compsErr.status !== 404) || (altsErr && altsErr.status !== 404)) {
          setError("Some data failed to load — showing partial results.");
        }
      } catch (e) {
        setError(e.message || "Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isLoaded, isSignedIn, user]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const initials = user?.firstName
    ? `${user.firstName[0]}${user.lastName?.[0] || ""}`.toUpperCase()
    : "?";

  const firstName = user?.firstName || "there";
  const corridor = (profile?.corridor_from && profile?.corridor_to)
    ? `${profile.corridor_from} → ${profile.corridor_to}`
    : null;
  const activeAlerts = (alerts || []).filter(a => a.is_active !== false).slice(0, 4);
  const totalComparisons = comparisons?.length || 0;
  const totalAlerts = (alerts || []).length;

  if (!isLoaded || (isLoaded && !isSignedIn)) return null;

  const isActive = (item) => {
    if (item.key === "dashboard") return router.pathname === "/dashboard";
    if (item.key === "transfers") return router.pathname === "/results";
    if (item.key === "history") return router.pathname === "/history";
    if (item.key === "alerts") return router.pathname === "/alerts";
    return false;
  };

  return (
    <>
      <Head>
        <title>Dashboard — Vaulto</title>
        <meta name="description" content="Your Vaulto dashboard — compare rates, track alerts, and view transfer history." />
      </Head>

      <div className="db-layout">
        {/* ── Sidebar ── */}
        <aside className={`db-sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>

          {/* Logo */}
          <div className="sidebar-logo-wrap">
            <Link href="/" className="logo sidebar-logo">
              <span className="logo-mark">V</span>
              <span>Vaulto</span>
            </Link>
            {isAdmin(user?.id) && (
              <span className="sidebar-tier" style={{ backgroundColor: "#7c3aed" }}>Admin</span>
            )}
          </div>

          {/* Nav links */}
          <nav className="sidebar-nav">
            <p className="sidebar-nav-label">Navigation</p>

            {NAV_ITEMS.map(item => (
              <Link
                key={item.key}
                href={item.href}
                className={`sidebar-link ${isActive(item) ? "sidebar-link-active" : ""}`}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="sidebar-icon">{item.icon}</span>
                <span className="sidebar-label">{item.label}</span>
              </Link>
            ))}

            {isAdmin(user?.id) && (
              <Link href="/admin/analytics" className="sidebar-link">
                <span className="sidebar-icon">📊</span>
                <span className="sidebar-label">Analytics</span>
              </Link>
            )}
          </nav>

          {/* User + Logout */}
          <div className="sidebar-bottom">
            <div className="sidebar-user">
              <div className="sb-avatar">{initials}</div>
              <div className="sb-user-info">
                <div className="sb-name">{user?.fullName || firstName}</div>
                <div className="sb-verified">Verified ✓</div>
              </div>
            </div>
            <button className="btn-ghost-sm sidebar-logout" onClick={handleSignOut} id="dashboard-logout">
              Logout
            </button>
          </div>
        </aside>

        {/* Mobile overlay */}
        {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

        {/* ── Main content ── */}
        <main className="db-main">
          {/* Mobile header */}
          <div className="db-mobile-header">
            <button className="hamburger" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Menu">
              <span className="ham-line" /><span className="ham-line" /><span className="ham-line" />
            </button>
            <Link href="/" className="logo" style={{ fontSize: "1.1rem" }}>
              <span className="logo-mark" style={{ width: 22, height: 22, fontSize: "0.7rem" }}>V</span>
              <span>Vaulto</span>
            </Link>
          </div>

          <div className="db-content">
            {error && (
              <div className="error-box" style={{ marginBottom: "1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>⚠️ {error}</div>
                <div>
                  <button onClick={() => window.location.reload()} style={{ marginLeft: "1rem", background: "none", border: "none", cursor: "pointer", color: "inherit", textDecoration: "underline", fontWeight: "bold" }}>Retry</button>
                  <button onClick={() => setError("")} style={{ marginLeft: "1rem", background: "none", border: "none", cursor: "pointer", color: "inherit", textDecoration: "underline" }}>Dismiss</button>
                </div>
              </div>
            )}

            {/* Greeting */}
            <div className="db-header">
              <p className="label-sm">Overview</p>
              <h1 className="display-md" style={{ margin: "0.25rem 0 0.5rem" }}>
                {getGreeting()}, {firstName}.
              </h1>
              {corridor && (
                <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
                  Your active corridor: <strong style={{ color: "var(--text-mid)" }}>{corridor}</strong>
                </p>
              )}
            </div>

            {/* Smart Insight Card */}
            {corridor && (
              <div className="smart-card anim-fade-up">
                <div>
                  <p className="label-sm" style={{ color: "rgba(255,255,255,0.5)", marginBottom: "0.5rem" }}>
                    Smart Insight — {corridor}
                  </p>
                  <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.3rem", color: "white", marginBottom: "0.5rem" }}>
                    Your corridor is active
                  </h2>
                  <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.875rem", maxWidth: "480px" }}>
                    Live rates are available for your {corridor} corridor. Compare now to find the best provider for your next transfer.
                  </p>
                </div>
                <Link
                  href={`/results?from=${profile.corridor_from}&to=${profile.corridor_to}&amount=1000`}
                  className="btn-secondary"
                  style={{ flexShrink: 0, alignSelf: "flex-start" }}
                  id="dashboard-compare-now"
                >
                  Compare now →
                </Link>
              </div>
            )}

            {/* Quick Compare Widget */}
            <div className="card anim-fade-up anim-delay-1" style={{ marginBottom: "1.5rem" }}>
              <p className="label-sm" style={{ marginBottom: "1rem" }}>Quick Compare</p>
              <CompareWidget
                defaultFrom={profile?.corridor_from || "AUD"}
                defaultTo={profile?.corridor_to || "INR"}
                defaultAmount={1000}
              />
            </div>

            {/* 2-col grid */}
            <div className="db-grid anim-fade-up anim-delay-2">
              {/* Recent Transfers */}
              <div className="card">
                <div className="card-section-header">
                  <p className="label-sm">Recent Transfers</p>
                  <Link href="/history" style={{ fontSize: "0.8rem", color: "var(--secondary)", textDecoration: "none", fontWeight: 600 }}>View all →</Link>
                </div>
                {loading ? (
                  [1, 2, 3].map(i => <div key={i} className="skeleton-line" style={{ margin: "0.75rem 0" }} />)
                ) : comparisons.length > 0 ? (
                  <div className="recent-list">
                    {comparisons.slice(0, 5).map((c, i) => {
                      let best = "—";
                      try { const r = JSON.parse(c.results_json || "[]"); best = r[0]?.provider || "—"; } catch { }
                      return (
                        <div key={i} className="recent-item">
                          <div>
                            <div className="recent-corridor">{c.from_currency} → {c.to_currency}</div>
                            <div className="recent-meta">{new Date(c.created_at).toLocaleDateString()} · {best}</div>
                          </div>
                          <Link href={`/results?from=${c.from_currency}&to=${c.to_currency}&amount=${c.amount}`} className="recent-rerun">
                            Re-run →
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="empty-state-sm">
                    <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>🔍</div>
                    <p>No comparisons yet</p>
                    <Link href="/results?from=GBP&to=INR&amount=1000" className="btn-secondary" style={{ marginTop: "0.75rem", fontSize: "0.85rem", padding: "0.5rem 1rem" }}>
                      Start comparing →
                    </Link>
                  </div>
                )}
              </div>

              {/* Rate Alerts */}
              <div className="card">
                <div className="card-section-header">
                  <p className="label-sm">Rate Alerts</p>
                  <Link href="/alerts" style={{ fontSize: "0.8rem", color: "var(--secondary)", textDecoration: "none", fontWeight: 600 }}>Manage →</Link>
                </div>
                {loading ? (
                  [1, 2].map(i => <div key={i} className="skeleton-line" style={{ margin: "0.75rem 0" }} />)
                ) : activeAlerts.length > 0 ? (
                  <div className="alerts-list">
                    {activeAlerts.map(a => (
                      <div key={a.id} className="alert-item">
                        <div>
                          <div className="alert-corridor">{a.from_currency} → {a.to_currency}</div>
                          <div className="alert-meta">Target: {a.target_rate} · {a.amount} {a.from_currency}</div>
                        </div>
                        <span className="pill pill-tertiary" style={{ fontSize: "0.65rem" }}>● Active</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state-sm">
                    <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>🔔</div>
                    <p>No active alerts</p>
                  </div>
                )}
                <button
                  className="btn-secondary"
                  style={{ width: "100%", justifyContent: "center", marginTop: "1rem", fontSize: "0.875rem" }}
                  onClick={() => setAlertModalOpen(true)}
                  id="dashboard-new-alert"
                >
                  + New Alert
                </button>
              </div>
            </div>

            {/* Stats row */}
            <div className="db-stats anim-fade-up anim-delay-3">
              <div className="stat-mini">
                <div className="stat-mini-value">{loading ? "—" : totalComparisons}</div>
                <div className="label-sm">Saved comparisons</div>
              </div>
              <div className="stat-mini">
                <div className="stat-mini-value">{loading ? "—" : totalAlerts}</div>
                <div className="label-sm">Active alerts</div>
              </div>
              <div className="stat-mini">
                <div className="stat-mini-value" style={{ fontSize: "1.1rem" }}>{loading ? "—" : (corridor || "—")}</div>
                <div className="label-sm">Your corridor</div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <AlertModal
        isOpen={alertModalOpen}
        onClose={() => setAlertModalOpen(false)}
        onSuccess={(newAlert) => {
          setAlerts(prev => [newAlert, ...prev]);
          setAlertModalOpen(false);
        }}
        defaultFrom={profile?.corridor_from || "GBP"}
        defaultTo={profile?.corridor_to || "INR"}
        defaultAmount={1000}
        userWhatsapp={profile?.whatsapp_number}
      />

      <style jsx>{`
        /* ── Layout ── */
        .db-layout {
          display: flex;
          min-height: 100vh;
          background: var(--bg);
        }

        /* ── Sidebar ── */
        .db-sidebar {
          width: 240px;
          min-height: 100vh;
          background: var(--primary);
          display: flex;
          flex-direction: column;
          position: sticky;
          top: 0;
          height: 100vh;
          overflow-y: auto;
          flex-shrink: 0;
          z-index: 50;
        }
        @media (max-width: 900px) {
          .db-sidebar {
            position: fixed;
            left: -260px;
            transition: left 0.3s ease;
          }
          .sidebar-open { left: 0 !important; box-shadow: var(--shadow-lg); }
        }

        .sidebar-overlay {
          position: fixed; inset: 0; z-index: 40;
          background: rgba(0,0,0,0.5);
        }

        /* Logo row */
        .sidebar-logo-wrap {
          padding: 1.5rem 1.25rem 1.25rem;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          display: flex; align-items: center; gap: 0.75rem;
        }
        .sidebar-logo { color: white !important; font-size: 1.2rem; }
        .sidebar-tier {
          font-size: 0.6rem; font-weight: 700; letter-spacing: 0.08em;
          color: white; padding: 0.15rem 0.5rem;
          border-radius: var(--radius-full); text-transform: uppercase;
        }

        /* Nav section */
        .sidebar-nav {
          flex: 1;
          padding: 1.25rem 0.75rem;
          display: flex; flex-direction: column; gap: 0.25rem;
        }

        /* ── FIX 2: "NAVIGATION" section label ── */
        .sidebar-nav-label {
          font-size: 0.6rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.3);
          padding: 0 0.25rem;
          margin-bottom: 0.5rem;
        }

        /* ── FIX 1: font-size was 0.0875rem (1.4px = invisible). Fixed to 0.875rem ── */
        .sidebar-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          border-radius: var(--radius-md);
          font-size: 0.875rem;          /* ← WAS 0.0875rem — THE ROOT CAUSE */
          font-weight: 600;
          letter-spacing: 0.01em;
          color: rgba(255,255,255,0.75) !important;
          text-decoration: none;
          transition: background 0.15s, color 0.15s, border-color 0.15s;
          border-left: 3px solid transparent;
        }
        .sidebar-link:hover {
          background: rgba(255,255,255,0.09);
          color: #ffffff !important;
          border-left-color: rgba(255,255,255,0.2);
        }
        .sidebar-link-active {
          background: rgba(0,88,190,0.22) !important;
          color: white !important;
          border-left-color: var(--secondary) !important;
          font-weight: 700;
        }

        .sidebar-icon {
          font-size: 1rem;
          width: 20px;
          text-align: center;
          flex-shrink: 0;
        }
        .sidebar-label { line-height: 1; }

        /* User + logout */
        .sidebar-bottom {
          padding: 1.25rem 0.75rem 1.75rem;
          border-top: 1px solid rgba(255,255,255,0.06);
          display: flex; flex-direction: column; gap: 0.75rem;
        }
        .sidebar-user { display: flex; align-items: center; gap: 0.75rem; }
        .sb-avatar {
          width: 36px; height: 36px; border-radius: 50%;
          background: linear-gradient(135deg, var(--secondary), var(--tertiary));
          display: flex; align-items: center; justify-content: center;
          font-family: var(--font-display); font-weight: 800;
          font-size: 0.8rem; color: white; flex-shrink: 0;
        }
        .sb-name     { font-size: 0.875rem; font-weight: 600; color: #ffffff; }
        .sb-verified { font-size: 0.7rem; color: rgba(255,255,255,0.6); }

        .sidebar-logout {
          color: rgba(255,255,255,0.5);
          border-color: rgba(255,255,255,0.1);
          width: 100%; justify-content: center;
        }
        .sidebar-logout:hover { color: white; border-color: rgba(255,255,255,0.3); }

        /* ── Main ── */
        .db-main { flex: 1; min-width: 0; display: flex; flex-direction: column; }

        .db-mobile-header {
          display: none;
          align-items: center; gap: 1rem;
          padding: 1rem 1.5rem;
          background: var(--surface-float);
          border-bottom: 1px solid var(--surface-high);
          position: sticky; top: 0; z-index: 30;
        }
        @media (max-width: 900px) { .db-mobile-header { display: flex; } }

        .hamburger { display: flex; flex-direction: column; gap: 5px; background: none; border: none; cursor: pointer; padding: 4px; }
        .ham-line   { display: block; width: 22px; height: 2px; background: var(--text); border-radius: 2px; }

        .db-content { padding: 2rem 2.5rem; max-width: 1000px; }
        @media (max-width: 900px) { .db-content { padding: 1.5rem; } }

        .db-header { margin-bottom: 2rem; }

        /* Smart insight card */
        .smart-card {
          background: linear-gradient(135deg, var(--primary) 0%, #1e3460 100%);
          border-radius: var(--radius-xl);
          padding: 2rem;
          display: flex; align-items: flex-start; justify-content: space-between;
          gap: 1.5rem; margin-bottom: 1.5rem;
          position: relative; overflow: hidden;
        }
        .smart-card::before {
          content: "";
          position: absolute; top: -40px; right: -40px;
          width: 180px; height: 180px;
          background: radial-gradient(circle, rgba(0,88,190,0.2), transparent 70%);
          border-radius: 50%;
        }
        @media (max-width: 600px) { .smart-card { flex-direction: column; } }

        /* Two-column grid */
        .db-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem; margin-bottom: 1.5rem;
        }
        @media (max-width: 700px) { .db-grid { grid-template-columns: 1fr; } }

        .card-section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; }

        .recent-list  { display: flex; flex-direction: column; }
        .recent-item  { display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px solid var(--surface-high); }
        .recent-item:last-child { border-bottom: none; }
        .recent-corridor { font-family: var(--font-display); font-weight: 700; font-size: 0.95rem; color: var(--text); }
        .recent-meta     { font-size: 0.75rem; color: var(--muted); margin-top: 0.15rem; }
        .recent-rerun    { font-size: 0.8rem; color: var(--secondary); text-decoration: none; font-weight: 600; }
        .recent-rerun:hover { text-decoration: underline; }

        .alerts-list { display: flex; flex-direction: column; }
        .alert-item  { display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px solid var(--surface-high); }
        .alert-item:last-child { border-bottom: none; }
        .alert-corridor { font-family: var(--font-display); font-weight: 700; font-size: 0.95rem; }
        .alert-meta     { font-size: 0.75rem; color: var(--muted); margin-top: 0.15rem; }

        .empty-state-sm { text-align: center; padding: 1.5rem 0; color: var(--muted); font-size: 0.875rem; }
        .empty-state-sm p { margin-bottom: 0.25rem; }

        /* Stats row */
        .db-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
        }
        @media (max-width: 600px) { .db-stats { grid-template-columns: 1fr; } }

        .stat-mini {
          background: var(--surface-float);
          border-radius: var(--radius-md);
          padding: 1.25rem; box-shadow: var(--shadow-sm); text-align: center;
        }
        .stat-mini-value {
          font-family: var(--font-display);
          font-size: 1.8rem; font-weight: 800;
          letter-spacing: -0.03em; color: var(--text); margin-bottom: 0.25rem;
        }
      `}</style>
    </>
  );
}