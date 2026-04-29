import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "@clerk/nextjs";
import { listAlerts, updateAlert, deleteAlert, getMe } from "../lib/api";
import AlertModal from "../components/AlertModal";

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function StatusPill({ active }) {
  return (
    <span className={`pill ${active ? "pill-tertiary" : "pill-muted"}`} style={{ fontSize: "0.65rem" }}>
      {active ? "● Active" : "⏸ Paused"}
    </span>
  );
}

export default function Alerts() {
  const router = useRouter();
  const { isLoaded, isSignedIn, getToken } = useAuth();

  const [alerts, setAlerts] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState({ open: false, edit: null });
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    if (isLoaded && !isSignedIn) router.replace("/auth");
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    const run = async () => {
      setLoading(true);
      try {
        const token = await getToken();
        const [alts, me] = await Promise.all([listAlerts(token), getMe(token)]);
        setAlerts(alts);
        setProfile(me);
      } catch (err) {
        setError(err.message || "Failed to load alerts.");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [isLoaded, isSignedIn, getToken]);

  const handleToggle = async (alert) => {
    try {
      const token = await getToken();
      const updated = await updateAlert(token, alert.id, { is_active: !alert.is_active });
      setAlerts((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    } catch {
      setError("Failed to update alert.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this alert?")) return;
    setDeleting(id);
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    try {
      const token = await getToken();
      await deleteAlert(token, id);
    } catch {
      setError("Delete failed. Refreshing…");
      try {
        const token = await getToken();
        setAlerts(await listAlerts(token));
      } catch (_) {}
    } finally {
      setDeleting(null);
    }
  };

  const handleSaved = (saved) => {
    setAlerts((prev) => {
      const idx = prev.findIndex((a) => a.id === saved.id);
      if (idx >= 0) { const next = [...prev]; next[idx] = saved; return next; }
      return [saved, ...prev];
    });
  };

  const activeAlerts = alerts.filter(a => a.is_active);
  const pausedAlerts = alerts.filter(a => !a.is_active);

  return (
    <>
      <Head>
        <title>Rate Alerts — Vaulto</title>
        <meta name="description" content="Manage your rate alerts on Vaulto. Get notified when exchange rates hit your target." />
      </Head>

      {/* Nav */}
      <nav className="nav">
        <div className="container nav-inner">
          <Link href="/" className="logo">
            <span className="logo-mark">V</span>
            Vaulto
          </Link>
          <div className="nav-links">
            <Link href="/dashboard" className="nav-link">← Dashboard</Link>
            <Link href="/results?from=GBP&to=INR&amount=1000" className="nav-link">Compare</Link>
          </div>
          <button
            className="btn-primary"
            style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}
            onClick={() => setModal({ open: true, edit: null })}
          >
            + New Alert
          </button>
        </div>
      </nav>

      <main style={{ padding: "3rem 0 6rem" }}>
        <div className="container" style={{ maxWidth: "960px" }}>
          {/* Header */}
          <div style={{ marginBottom: "2.5rem" }}>
            <div className="label-sm" style={{ marginBottom: "0.4rem" }}>Monitoring</div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.03em", marginBottom: "0.4rem" }}>
              Rate Alerts
            </h1>
            <p style={{ color: "var(--text-mid)", fontSize: "0.95rem" }}>
              We monitor exchange rates 24/7 and notify you when your target rate is hit.
            </p>
          </div>

          {error && <div className="error-box" style={{ marginBottom: "1.5rem" }}>⚠ {error}</div>}

          {loading ? (
            <div className="loading-box"><div className="spinner" />Loading alerts…</div>
          ) : alerts.length === 0 ? (
            /* Empty state */
            <div className="card" style={{ textAlign: "center", padding: "5rem 2rem" }}>
              <div style={{ width: "72px", height: "72px", background: "var(--secondary-dim)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", margin: "0 auto 1.5rem" }}>
                🔔
              </div>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.6rem" }}>No alerts yet</h2>
              <p style={{ color: "var(--muted)", marginBottom: "2rem", maxWidth: "340px", margin: "0 auto 2rem" }}>
                Create a rate alert and we'll notify you when your corridor hits your target rate.
              </p>
              <button className="btn-primary" style={{ margin: "0 auto", width: "auto" }} onClick={() => setModal({ open: true, edit: null })}>
                Create your first alert
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
              {/* Active alerts */}
              {activeAlerts.length > 0 && (
                <div>
                  <div className="label-sm" style={{ marginBottom: "1rem" }}>Active ({activeAlerts.length})</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {activeAlerts.map(a => (
                      <AlertCard key={a.id} alert={a} onToggle={handleToggle} onEdit={() => setModal({ open: true, edit: a })} onDelete={handleDelete} deleting={deleting} />
                    ))}
                  </div>
                </div>
              )}

              {/* Paused alerts */}
              {pausedAlerts.length > 0 && (
                <div>
                  <div className="label-sm" style={{ marginBottom: "1rem" }}>Paused ({pausedAlerts.length})</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {pausedAlerts.map(a => (
                      <AlertCard key={a.id} alert={a} onToggle={handleToggle} onEdit={() => setModal({ open: true, edit: a })} onDelete={handleDelete} deleting={deleting} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <AlertModal
        isOpen={modal.open}
        onClose={() => setModal({ open: false, edit: null })}
        onSuccess={handleSaved}
        defaultFrom={profile?.corridor_from || "GBP"}
        defaultTo={profile?.corridor_to || "INR"}
        defaultAmount={1000}
        editAlert={modal.edit}
        userWhatsapp={profile?.whatsapp_number || null}
      />
    </>
  );
}

function AlertCard({ alert: a, onToggle, onEdit, onDelete, deleting }) {
  return (
    <div className="card" style={{ padding: "1.25rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap", transition: "box-shadow 0.2s, transform 0.15s", cursor: "default" }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = "var(--shadow-md)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "var(--shadow-sm)"; e.currentTarget.style.transform = "translateY(0)"; }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", flex: 1 }}>
        {/* Corridor */}
        <div style={{ minWidth: "110px" }}>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.05rem", color: "var(--text)", letterSpacing: "-0.01em" }}>
            {a.from_currency} → {a.to_currency}
          </div>
          <StatusPill active={a.is_active} />
        </div>

        {/* Details */}
        <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
          <div>
            <div className="label-sm" style={{ marginBottom: "0.15rem" }}>Target rate</div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1rem", color: a.is_active ? "var(--tertiary)" : "var(--muted)" }}>
              {a.target_rate}
            </div>
          </div>
          <div>
            <div className="label-sm" style={{ marginBottom: "0.15rem" }}>Amount</div>
            <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text-mid)" }}>{a.amount}</div>
          </div>
          <div>
            <div className="label-sm" style={{ marginBottom: "0.15rem" }}>Provider</div>
            <div style={{ fontSize: "0.9rem", color: "var(--text-mid)" }}>{a.provider || "Any"}</div>
          </div>
          <div>
            <div className="label-sm" style={{ marginBottom: "0.15rem" }}>Notify via</div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-mid)" }}>
              {[a.notify_email && "Email", a.notify_whatsapp && "WhatsApp"].filter(Boolean).join(" + ") || "—"}
            </div>
          </div>
          <div>
            <div className="label-sm" style={{ marginBottom: "0.15rem" }}>Created</div>
            <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>{fmtDate(a.created_at)}</div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
        <button
          onClick={() => onToggle(a)}
          className="btn-ghost"
          style={{ padding: "0.4rem 0.75rem", fontSize: "0.8rem" }}
          title={a.is_active ? "Pause" : "Resume"}
        >
          {a.is_active ? "⏸ Pause" : "▶ Resume"}
        </button>
        <button onClick={onEdit} className="btn-ghost" style={{ padding: "0.4rem 0.75rem", fontSize: "0.8rem" }} title="Edit">
          ✏️ Edit
        </button>
        <button
          onClick={() => onDelete(a.id)}
          disabled={deleting === a.id}
          style={{ padding: "0.4rem 0.75rem", fontSize: "0.8rem", background: "none", border: "1px solid var(--outline)", borderRadius: "var(--radius-md)", cursor: "pointer", color: "var(--error)", transition: "background 0.15s, border-color 0.15s" }}
          onMouseEnter={e => { e.currentTarget.style.background = "var(--error-surface)"; e.currentTarget.style.borderColor = "var(--error)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.borderColor = "var(--outline)"; }}
          title="Delete"
        >
          🗑 Delete
        </button>
      </div>
    </div>
  );
}
