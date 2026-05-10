import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { COUNTRIES, UNIVERSITIES, getUniversities } from "../lib/universities";
import { PHONE_CODES } from "../lib/countryPhoneCodes";
import { COUNTRY_CURRENCY_MAP } from "../lib/currencies";
import { useAuth } from "@clerk/nextjs";
import { useUserProfile } from "../hooks/useUserProfile";
import { completeOnboarding } from "../lib/api";

const TOTAL_STEPS = 3;

// ── Reusable Tailwind SearchableDropdown ────────────────────────────────────
function TwDropdown({ items, value, onChange, placeholder, id, disabled }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [hlIdx, setHlIdx] = useState(0);
  const wrapperRef = useRef(null);
  const listRef = useRef(null);

  const filtered = useMemo(() => {
    if (!query.trim()) return items;
    const q = query.toLowerCase();
    return items.filter(
      (it) =>
        it.name.toLowerCase().includes(q) ||
        (it.city && it.city.toLowerCase().includes(q))
    );
  }, [items, query]);

  useEffect(() => { setHlIdx(0); }, [filtered.length, query]);

  // Outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Scroll into view
  useEffect(() => {
    if (open && listRef.current?.children[hlIdx]) {
      listRef.current.children[hlIdx].scrollIntoView({ block: "nearest" });
    }
  }, [hlIdx, open]);

  const select = useCallback(
    (item) => { onChange(item); setQuery(""); setOpen(false); },
    [onChange]
  );

  const onKey = (e) => {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "Enter") { setOpen(true); e.preventDefault(); }
      return;
    }
    if (e.key === "ArrowDown") { e.preventDefault(); setHlIdx((i) => Math.min(i + 1, filtered.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setHlIdx((i) => Math.max(i - 1, 0)); }
    else if (e.key === "Enter") { e.preventDefault(); if (filtered[hlIdx]) select(filtered[hlIdx]); }
    else if (e.key === "Escape") setOpen(false);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <div className="relative">
        <input
          id={id}
          type="text"
          value={open ? query : value || ""}
          placeholder={placeholder}
          onChange={(e) => { setQuery(e.target.value); if (!open) setOpen(true); }}
          onFocus={() => { setOpen(true); setQuery(""); }}
          onKeyDown={onKey}
          disabled={disabled}
          autoComplete="off"
          className="w-full bg-[#06080d] border border-[#243049] rounded-xl text-[#e8ecf4] text-sm py-3.5 px-4 pr-10 outline-none transition-all duration-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 placeholder:text-[#556078] disabled:opacity-40"
        />
        <svg
          className={`absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#556078] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>

      {open && (
        <div
          ref={listRef}
          className="absolute z-30 top-full mt-1.5 left-0 right-0 max-h-60 overflow-y-auto bg-[#111827] border border-[#243049] rounded-xl shadow-2xl animate-fade-in"
          style={{ scrollbarWidth: "thin", scrollbarColor: "#243049 transparent" }}
        >
          {filtered.length === 0 ? (
            <div className="py-6 px-4 text-center text-[#556078] text-sm">
              No results for &ldquo;{query}&rdquo;
            </div>
          ) : (
            filtered.map((item, i) => (
              <button
                key={item.name}
                type="button"
                onClick={() => select(item)}
                onMouseEnter={() => setHlIdx(i)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors duration-100 ${
                  i === hlIdx ? "bg-cyan-500/10 text-[#e8ecf4]" : "text-[#e8ecf4] hover:bg-cyan-500/5"
                } ${i === 0 ? "rounded-t-xl" : ""} ${i === filtered.length - 1 ? "rounded-b-xl" : ""}`}
              >
                <span className="text-lg leading-none shrink-0">{item.flag || "🏫"}</span>
                <span className="flex-1 truncate">{item.name}</span>
                {item.city && (
                  <span className="text-xs text-[#556078] shrink-0">{item.city}</span>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Onboarding Page
// ═══════════════════════════════════════════════════════════════════════════════
export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  // Step 1
  const [selectedCountry, setSelectedCountry] = useState(null);
  // Step 2 — university + corridor
  const [selectedUniversity, setSelectedUniversity] = useState(null);
  const [homeCurrency, setHomeCurrency]     = useState("GBP");
  const [corridorTo, setCorridorTo]         = useState("INR");
  // Step 3
  const [phoneCode, setPhoneCode] = useState("+91");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [waConsent, setWaConsent] = useState(false);

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { createProfile } = useUserProfile();
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/auth");
    }
  }, [isLoaded, isSignedIn, router]);

  const goNext = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS + 1));
  const goBack = () => setStep((s) => Math.max(s - 1, 1));

  const countryItems = useMemo(
    () => COUNTRIES.map((c) => ({ name: c.name, flag: c.flag, code: c.code })),
    []
  );

  const universityItems = useMemo(() => {
    if (!selectedCountry) return [];
    return (UNIVERSITIES[selectedCountry.code] || []).map((u) => ({
      ...u,
      flag: "🏫",
    }));
  }, [selectedCountry]);

  // Auto-set home currency when country changes
  useEffect(() => {
    if (selectedCountry) {
      const cur = COUNTRY_CURRENCY_MAP[selectedCountry.code];
      if (cur) setHomeCurrency(cur);
    }
  }, [selectedCountry]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleContinue = async () => {
    const errs = {};

    if (step === 1) {
      if (!selectedCountry) errs.country = "Please select a country";
      setErrors(errs);
      if (Object.keys(errs).length === 0) goNext();
    } else if (step === 2) {
      if (!selectedUniversity) errs.university = "Please select a university";
      setErrors(errs);
      if (Object.keys(errs).length === 0) goNext();
    } else if (step === 3) {
      setLoading(true);
      setSubmitError("");
      const whatsappFull = waConsent && phoneNumber ? `${phoneCode}${phoneNumber}` : null;
      try {
        const token = await getToken();
        await completeOnboarding(token, {
          country:          selectedCountry?.code || "",
          university:       selectedUniversity?.name || null,
          whatsapp_number:  whatsappFull,
          home_currency:    homeCurrency || null,
          corridor_from:    homeCurrency || null,
          corridor_to:      corridorTo   || null,
        });
        router.push("/dashboard");
      } catch (err) {
        setSubmitError(err.message || "Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  const stepLabels = [
    "Destination",
    "University",
    "Alerts",
  ];

  return (
    <>
      <Head>
        <title>Set Up Your Account — Flint</title>
        <meta name="description" content="Personalize your Flint experience in 3 easy steps." />
      </Head>

      <div className="min-h-screen bg-[#06080d] font-sans text-[#e8ecf4] relative overflow-hidden">
        {/* Ambient */}
        <div className="fixed top-[-30%] left-[-15%] w-[60%] h-[60%] rounded-full bg-cyan-500/[0.03] blur-[100px] pointer-events-none" />
        <div className="fixed bottom-[-25%] right-[-15%] w-[55%] h-[55%] rounded-full bg-blue-600/[0.025] blur-[80px] pointer-events-none" />

        {/* Grid */}
        <div
          className="fixed inset-0 pointer-events-none opacity-[0.025]"
          style={{
            backgroundImage: "linear-gradient(rgba(34,211,238,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.5) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage: "radial-gradient(ellipse at 50% 30%, black 20%, transparent 70%)",
            WebkitMaskImage: "radial-gradient(ellipse at 50% 30%, black 20%, transparent 70%)",
          }}
        />

        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-5 py-8">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2.5 mb-8">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white text-lg shadow-[0_0_20px_rgba(34,211,238,0.3)]">
              ⚡
            </div>
            <span className="text-xl font-extrabold tracking-tight">Flint</span>
          </a>

          {/* Progress indicator */}
          {step <= TOTAL_STEPS && (
            <div className="mb-8 w-full max-w-md">
              {/* Step dots with connecting lines */}
              <div className="flex items-center justify-center gap-1">
                {[1, 2, 3].map((s) => (
                  <div key={s} className="flex items-center gap-1">
                    <div
                      className={`transition-all duration-400 rounded-full ${
                        s === step
                          ? "w-7 h-2 bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.4)]"
                          : s < step
                          ? "w-2 h-2 bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.3)]"
                          : "w-2 h-2 bg-[#243049]"
                      }`}
                    />
                    {s < 3 && <div className={`w-8 h-px ${s < step ? "bg-emerald-400/40" : "bg-[#243049]"}`} />}
                  </div>
                ))}
              </div>
              <p className="text-center text-[#556078] text-[11px] tracking-[0.12em] uppercase mt-3">
                Step {step} of {TOTAL_STEPS} — {stepLabels[step - 1]}
              </p>
            </div>
          )}

          {/* ═══════ STEP 1: Country ═══════ */}
          {step === 1 && (
            <div
              key="step1"
              className="w-full max-w-md bg-[#0c1019] border border-[#1a2035] rounded-2xl p-7 shadow-[0_8px_32px_rgba(0,0,0,0.3)] relative animate-slide-up"
            >
              {/* Top glow line */}
              <div className="absolute top-0 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />

              <h2 className="text-xl font-extrabold tracking-tight mb-1">
                Where are you <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">sending money</span>?
              </h2>
              <p className="text-[#8892a8] text-sm mb-6 leading-relaxed">
                Select the country you&rsquo;re transferring funds to. We&rsquo;ll customize your experience.
              </p>

              <div className="mb-1">
                <label className="block text-[10px] font-semibold tracking-[0.08em] uppercase text-[#8892a8] mb-2">
                  Destination Country
                </label>
                <TwDropdown
                  id="onboard-country"
                  items={countryItems}
                  value={selectedCountry?.name || null}
                  onChange={(item) => {
                    const c = COUNTRIES.find((cc) => cc.code === item.code);
                    setSelectedCountry(c);
                    setSelectedUniversity(null);
                    setErrors({});
                  }}
                  placeholder="Search or select a country…"
                />
                {errors.country && (
                  <p className="text-red-400 text-xs mt-1.5">{errors.country}</p>
                )}
              </div>

              {selectedCountry && (
                <div className="mt-3 inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-lg px-3 py-1.5 text-xs font-medium animate-fade-in">
                  {selectedCountry.flag} {selectedCountry.name}
                  <button
                    type="button"
                    onClick={() => { setSelectedCountry(null); setSelectedUniversity(null); }}
                    className="text-cyan-400/70 hover:text-cyan-400 text-base leading-none ml-1"
                  >
                    ×
                  </button>
                </div>
              )}

              <div className="mt-7 flex gap-3">
                <button
                  onClick={handleContinue}
                  id="onboard-step1-continue"
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-sm py-3.5 rounded-xl hover:shadow-[0_6px_20px_rgba(34,211,238,0.25)] transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
                >
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* ═══════ STEP 2: University ═══════ */}
          {step === 2 && (
            <div
              key="step2"
              className="w-full max-w-md bg-[#0c1019] border border-[#1a2035] rounded-2xl p-7 shadow-[0_8px_32px_rgba(0,0,0,0.3)] relative animate-slide-up"
            >
              <div className="absolute top-0 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />

              <h2 className="text-xl font-extrabold tracking-tight mb-1">
                Select your <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">university</span>
              </h2>
              <p className="text-[#8892a8] text-sm mb-6 leading-relaxed">
                {selectedCountry
                  ? `Showing universities in ${selectedCountry.name}. This helps us personalize transfer routes for you.`
                  : "Select your university to personalize your experience."}
              </p>

              <div className="mb-1">
                <label className="block text-[10px] font-semibold tracking-[0.08em] uppercase text-[#8892a8] mb-2">
                  University
                </label>
                <TwDropdown
                  id="onboard-university"
                  items={universityItems}
                  value={selectedUniversity?.name || null}
                  onChange={(item) => {
                    setSelectedUniversity(item);
                    setErrors({});
                  }}
                  placeholder="Search for your university…"
                />
                {errors.university && (
                  <p className="text-red-400 text-xs mt-1.5">{errors.university}</p>
                )}
              </div>

              {selectedUniversity && (
                <div className="mt-3 inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-lg px-3 py-1.5 text-xs font-medium animate-fade-in">
                  🏫 {selectedUniversity.name}
                  {selectedUniversity.city && <span className="text-cyan-400/60">— {selectedUniversity.city}</span>}
                  <button
                    type="button"
                    onClick={() => setSelectedUniversity(null)}
                    className="text-cyan-400/70 hover:text-cyan-400 text-base leading-none ml-1"
                  >
                    ×
                  </button>
                </div>
              )}

              <div className="mt-7 flex gap-3">
                <button
                  onClick={goBack}
                  className="bg-[#06080d] border border-[#243049] text-[#8892a8] font-medium text-sm py-3.5 px-5 rounded-xl hover:border-[#556078] hover:text-[#e8ecf4] transition-all duration-200"
                >
                  ← Back
                </button>
                <button
                  onClick={handleContinue}
                  id="onboard-step2-continue"
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-sm py-3.5 rounded-xl hover:shadow-[0_6px_20px_rgba(34,211,238,0.25)] transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
                >
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* ═══════ STEP 3: WhatsApp ═══════ */}
          {step === 3 && (
            <div
              key="step3"
              className="w-full max-w-md bg-[#0c1019] border border-[#1a2035] rounded-2xl p-7 shadow-[0_8px_32px_rgba(0,0,0,0.3)] relative animate-slide-up"
            >
              <div className="absolute top-0 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />

              <h2 className="text-xl font-extrabold tracking-tight mb-1">
                Get <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">rate alerts</span> on WhatsApp
              </h2>
              <p className="text-[#8892a8] text-sm mb-5 leading-relaxed">
                We&rsquo;ll notify you when exchange rates improve for your corridor. Never miss a good rate.
              </p>

              {/* Value prop banner */}
              <div className="flex gap-3 bg-emerald-500/8 border border-emerald-500/15 rounded-xl p-4 mb-5">
                <span className="text-2xl leading-none shrink-0">💬</span>
                <div className="text-sm text-[#8892a8] leading-relaxed">
                  <span className="text-emerald-400 font-semibold">Smart rate alerts —</span> We monitor rates 24/7 and message you when it&rsquo;s the best time to transfer. Saves users <span className="text-emerald-400">2-4%</span> per transfer.
                </div>
              </div>

              <div className="mb-1">
                <label className="block text-[10px] font-semibold tracking-[0.08em] uppercase text-[#8892a8] mb-2">
                  WhatsApp Number
                  <span className="inline-flex ml-2 text-[9px] font-medium tracking-wider uppercase text-[#556078] bg-[#556078]/15 rounded px-1.5 py-0.5 align-middle">
                    Optional
                  </span>
                </label>
                <div className="flex gap-2">
                  <select
                    id="onboard-phone-code"
                    value={phoneCode}
                    onChange={(e) => setPhoneCode(e.target.value)}
                    className="w-[100px] shrink-0 bg-[#06080d] border border-[#243049] rounded-xl text-[#e8ecf4] text-sm py-3.5 px-2.5 outline-none transition-all duration-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 appearance-none cursor-pointer"
                  >
                    {PHONE_CODES.map((pc) => (
                      <option key={`${pc.flag}-${pc.code}-${pc.country}`} value={pc.code}>
                        {pc.flag} {pc.code}
                      </option>
                    ))}
                  </select>
                  <input
                    id="onboard-phone"
                    type="tel"
                    placeholder="Your phone number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/[^\d\s()-]/g, ""))}
                    className="flex-1 bg-[#06080d] border border-[#243049] rounded-xl text-[#e8ecf4] text-sm py-3.5 px-4 outline-none transition-all duration-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 placeholder:text-[#556078]"
                  />
                </div>
              </div>

              {/* WhatsApp consent checkbox */}
              <label className="flex items-start gap-2.5 mt-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={waConsent}
                  onChange={(e) => setWaConsent(e.target.checked)}
                  className="mt-1 accent-cyan-500"
                  id="onboard-wa-consent"
                />
                <span className="text-[#8892a8] text-xs leading-relaxed">
                  I agree to receive rate alerts via WhatsApp. We only message you about rates — no spam, ever.
                </span>
              </label>

              {submitError && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5 text-red-400 text-xs animate-slide-up mt-4">
                  {submitError}
                </div>
              )}

              <div className="mt-7 flex gap-3">
                <button
                  onClick={goBack}
                  className="bg-[#06080d] border border-[#243049] text-[#8892a8] font-medium text-sm py-3.5 px-5 rounded-xl hover:border-[#556078] hover:text-[#e8ecf4] transition-all duration-200"
                >
                  ← Back
                </button>
                <button
                  onClick={handleContinue}
                  disabled={loading}
                  id="onboard-finish"
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-sm py-3.5 rounded-xl hover:shadow-[0_6px_20px_rgba(34,211,238,0.25)] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    "Finish Setup →"
                  )}
                </button>
              </div>
              <button
                onClick={async () => {
                  if (loading) return;
                  setLoading(true);
                  setSubmitError("");
                  try {
                    const token = await getToken();
                    await completeOnboarding(token, {
                      country:          selectedCountry?.code || "",
                      university:       selectedUniversity?.name || null,
                      whatsapp_number:  null,
                      home_currency:    homeCurrency || null,
                      corridor_from:    homeCurrency || null,
                      corridor_to:      corridorTo   || null,
                    });
                    router.push("/dashboard");
                  } catch (err) {
                    setSubmitError(err.message || "Something went wrong. Please try again.");
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
                className="w-full text-center text-[#556078] text-sm mt-3 py-2 hover:text-[#8892a8] transition-colors disabled:opacity-50"
                type="button"
              >
                Skip — I&rsquo;ll do this later
              </button>
            </div>
          )}

          {/* ═══════ COMPLETION ═══════ */}
          {step > TOTAL_STEPS && (
            <div
              key="done"
              className="w-full max-w-md bg-[#0c1019] border border-[#1a2035] rounded-2xl p-7 shadow-[0_8px_32px_rgba(0,0,0,0.3)] text-center animate-slide-up"
            >
              <div className="w-[72px] h-[72px] rounded-full bg-gradient-to-br from-cyan-500/15 to-blue-600/15 flex items-center justify-center text-3xl mx-auto mb-5 animate-pulse-glow">
                🚀
              </div>
              <h2 className="text-2xl font-extrabold tracking-tight mb-2">
                You&rsquo;re all set!
              </h2>
              <p className="text-[#8892a8] text-sm leading-relaxed mb-6">
                Your Flint account is ready
                {selectedCountry && (
                  <> — optimized for transfers to <span className="text-[#e8ecf4] font-medium">{selectedCountry.name}</span></>
                )}.
              </p>

              {/* Features grid */}
              <div className="grid grid-cols-2 gap-2.5 mb-6">
                {[
                  { icon: "📊", label: "Live rate comparison" },
                  { icon: "🔔", label: "Smart alerts" },
                  { icon: "💡", label: "Personalized picks" },
                  { icon: "🏦", label: "3+ providers" },
                ].map((f) => (
                  <div
                    key={f.label}
                    className="flex items-center gap-2 bg-[#06080d] border border-[#1a2035] rounded-lg px-3 py-2.5 text-[#8892a8] text-xs"
                  >
                    <span className="text-base">{f.icon}</span>
                    {f.label}
                  </div>
                ))}
              </div>

              <button
                onClick={() => router.push("/")}
                id="onboard-go-dashboard"
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-sm py-3.5 rounded-xl hover:shadow-[0_6px_20px_rgba(34,211,238,0.25)] transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
              >
                Start Comparing Rates →
              </button>
            </div>
          )}

          {/* Trust footer */}
          {step <= TOTAL_STEPS && (
            <div className="flex items-center justify-center gap-5 mt-8 text-[#556078] text-[11px]">
              <div className="flex items-center gap-1.5">
                <span>🔒</span> 256-bit encryption
              </div>
              <div className="flex items-center gap-1.5">
                <span>🛡️</span> No data selling
              </div>
              <div className="flex items-center gap-1.5">
                <span>⚡</span> Free forever
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
