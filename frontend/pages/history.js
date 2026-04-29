import { useState, useEffect, useMemo } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "@clerk/nextjs";
import { listComparisons } from "../lib/api";

const LIMIT = 20;

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
  });
}

function fmt(n) {
  return new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}

function exportCSV(rows) {
  const headers = ["Date", "From", "To", "Amount", "Best Rate", "Best Provider"];
  const lines = rows.map((r) => {
    let bestProvider = "—";
    let bestRate = "—";
    try {
      const results = JSON.parse(r.results_json);
      if (results?.length > 0) {
        bestProvider = results[0].provider;
        bestRate = results[0].exchange_rate;
      }
    } catch (_) {}
    return [
      fmtDate(r.created_at),
      r.from_currency,
      r.to_currency,
      fmt(r.amount),
      bestRate,
      bestProvider,
    ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",");
  });

  const csv = [headers.join(","), ...lines].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `vaulto-history-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function History() {
  const router = useRouter();
  const { isLoaded, isSignedIn, getToken } = useAuth();

  const [rows, setRows]         = useState([]);
  const [page, setPage]         = useState(1);
  const [hasMore, setHasMore]   = useState(true);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [search, setSearch]     = useState("");

  // Auth guard
  useEffect(() => {
    if (isLoaded && !isSignedIn) router.replace("/auth");
  }, [isLoaded, isSignedIn, router]);

  const fetchPage = async (p) => {
    if (!isLoaded || !isSignedIn) return;
    setLoading(true);
    setError("");
    try {
      const token = await getToken();
      const data = await listComparisons(token, { page: p, limit: LIMIT });
      setRows(data);
      setHasMore(data.length === LIMIT);
    } catch (err) {
      setError(err.message || "Failed to load history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded && isSignedIn) fetchPage(page);
  }, [isLoaded, isSignedIn, page]);

  const filtered = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.toLowerCase();
    return rows.filter(
      (r) =>
        r.from_currency.toLowerCase().includes(q) ||
        r.to_currency.toLowerCase().includes(q)
    );
  }, [rows, search]);

  return (
    <>
      <Head>
        <title>Transfer History — Vaulto</title>
        <meta name="description" content="Your comparison history on Vaulto" />
      </Head>

      <nav className="nav">
        <div className="container nav-inner">
          <Link href="/" className="logo">
            <span className="logo-mark">V</span>Vaulto
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <Link href="/dashboard" className="nav-link">← Dashboard</Link>
          </div>
        </div>
      </nav>

      <main className="container" style={{ paddingTop: "2.5rem", paddingBottom: "5rem" }}>
        <div style={{ marginBottom: "2rem" }}>
          <div className="label-sm" style={{ marginBottom: "0.4rem" }}>Account</div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem" }}>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.03em" }}>
              Transfer History
            </h1>
            <button
              className="btn-ghost"
              style={{ padding: "0.55rem 1rem", fontSize: "0.875rem" }}
              onClick={() => exportCSV(filtered)}
              disabled={filtered.length === 0}
            >
              ↓ Export CSV
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="field" style={{ maxWidth: 300, marginBottom: "1.25rem" }}>
          <label htmlFor="hist-search">Filter by currency</label>
          <input
            id="hist-search"
            type="text"
            placeholder="e.g. GBP, INR"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {error && <div className="error-box" style={{ marginBottom: "1rem" }}>⚠ {error}</div>}

        {loading ? (
          <div className="loading-box"><div className="spinner" />Loading history…</div>
        ) : filtered.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
            <p style={{ color: "var(--muted)", marginBottom: "1.25rem" }}>
              {search ? "No results match your filter." : "You haven't run any comparisons yet."}
            </p>
            <a href="/" className="btn-compare" style={{ textDecoration: "none", display: "inline-block", width: "auto", padding: "0.65rem 1.25rem" }}>
              Try a comparison →
            </a>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Corridor</th>
                  <th>Amount</th>
                  <th>Best Rate</th>
                  <th>Best Provider</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => {
                  let bestProvider = "—";
                  let bestRate = "—";
                  try {
                    const results = JSON.parse(r.results_json);
                    if (results?.length > 0) {
                      bestProvider = results[0].provider;
                      bestRate = results[0].exchange_rate?.toFixed(4) || "—";
                    }
                  } catch (_) {}
                  return (
                    <tr key={r.id}>
                      <td className="td-mono" style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
                        {fmtDate(r.created_at)}
                      </td>
                      <td style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}>
                        {r.from_currency} → {r.to_currency}
                      </td>
                      <td className="td-mono">{fmt(r.amount)}</td>
                      <td className="td-mono td-receive">{bestRate}</td>
                      <td>{bestProvider}</td>
                      <td>
                        <a
                          href={`/results?from=${r.from_currency}&to=${r.to_currency}&amount=${r.amount}`}
                          style={{ color: "var(--secondary)", fontSize: "0.78rem", textDecoration: "none" }}
                        >
                          Re-run →
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && (
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.25rem", justifyContent: "center" }}>
            <button
              className="btn-ghost"
              style={{ width: "auto", padding: "0.6rem 1.1rem", fontSize: "0.85rem" }}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              ← Previous
            </button>
            <span style={{ color: "var(--muted)", fontSize: "0.85rem", alignSelf: "center" }}>Page {page}</span>
            <button
              className="btn-compare"
              style={{ width: "auto", padding: "0.6rem 1.1rem", fontSize: "0.85rem", opacity: !hasMore ? 0.4 : 1 }}
              onClick={() => setPage((p) => p + 1)}
              disabled={!hasMore}
            >
              Next →
            </button>
          </div>
        )}
      </main>
    </>
  );
}
