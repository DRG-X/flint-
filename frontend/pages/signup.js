import { useState, useCallback, useMemo } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { COUNTRIES, getUniversities } from "../lib/universities";
import { PHONE_CODES } from "../lib/countryPhoneCodes";
import SearchableDropdown from "../components/SearchableDropdown";

const TOTAL_STEPS = 4;

// ── Password strength helper ─────────────────────────────────────────────────
function getPasswordStrength(pw) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { level: "weak", label: "Weak", segments: 1 };
  if (score <= 3) return { level: "medium", label: "Fair", segments: 2 };
  return { level: "strong", label: "Strong", segments: 3 };
}

// ═══════════════════════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════════════════════
export default function Signup() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [animDir, setAnimDir] = useState("forward");

  // Step 1: Basic info
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  // Step 2: Personalization
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedUniversity, setSelectedUniversity] = useState(null);

  // Step 3: Preferences
  const [preferences, setPreferences] = useState([]);

  // Step 4: WhatsApp
  const [phoneCode, setPhoneCode] = useState("+91");
  const [phoneNumber, setPhoneNumber] = useState("");

  // Validation
  const [errors, setErrors] = useState({});

  // ── Navigation ────────────────────────────────────────────────────────────
  const goNext = useCallback(() => {
    setAnimDir("forward");
    setStep((s) => Math.min(s + 1, TOTAL_STEPS + 1)); // +1 for completion
  }, []);

  const goBack = useCallback(() => {
    setAnimDir("back");
    setStep((s) => Math.max(s - 1, 1));
  }, []);

  // ── Step 1 validation ────────────────────────────────────────────────────
  const validateStep1 = () => {
    const errs = {};
    if (!name.trim()) errs.name = "Please enter your name";
    if (!email.trim()) errs.email = "Please enter your email";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errs.email = "Please enter a valid email";
    if (!password) errs.password = "Please create a password";
    else if (password.length < 8)
      errs.password = "Use at least 8 characters";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Step 2 validation ────────────────────────────────────────────────────
  const validateStep2 = () => {
    const errs = {};
    if (!selectedCountry) errs.country = "Please select a country";
    if (!selectedUniversity) errs.university = "Please select a university";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Handle continue for each step ────────────────────────────────────────
  const handleContinue = () => {
    if (step === 1 && validateStep1()) goNext();
    else if (step === 2 && validateStep2()) goNext();
    else if (step === 3) goNext();
    else if (step === 4) goNext();
  };

  // ── University list for selected country ──────────────────────────────────
  const universityItems = useMemo(() => {
    if (!selectedCountry) return [];
    return getUniversities(selectedCountry.code).map((u) => ({
      ...u,
      flag: "🏫",
    }));
  }, [selectedCountry]);

  // ── Country items with flag for dropdown ──────────────────────────────────
  const countryItems = useMemo(
    () =>
      COUNTRIES.map((c) => ({
        name: c.name,
        flag: c.flag,
        code: c.code,
      })),
    []
  );

  // ── Toggle preferences ────────────────────────────────────────────────────
  const togglePref = (pref) => {
    setPreferences((prev) =>
      prev.includes(pref) ? prev.filter((p) => p !== pref) : [...prev, pref]
    );
  };

  // ── Password strength ─────────────────────────────────────────────────────
  const pwStrength = password ? getPasswordStrength(password) : null;

  // ── Step label ─────────────────────────────────────────────────────────────
  const stepLabels = [
    "Create account",
    "Personalization",
    "Preferences",
    "WhatsApp alerts",
  ];

  // ═════════════════════════════════════════════════════════════════════════════
  // Render
  // ═════════════════════════════════════════════════════════════════════════════
  return (
    <>
      <Head>
        <title>Join Vaulto — Smart Money Transfer Comparison</title>
        <meta
          name="description"
          content="Create your Vaulto account and get personalized international money transfer comparisons."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="ob-page">
        <div className="ob-grid-overlay" />

        <div className="ob-container">
          {/* Logo */}
          <a href="/" className="ob-logo">
            <span className="ob-logo-icon">V</span>
            Vaulto
          </a>

          {/* Progress */}
          {step <= TOTAL_STEPS && (
            <div className="ob-progress-wrapper">
              <div className="ob-progress-steps">
                {[1, 2, 3, 4].map((s) => (
                  <div
                    key={s}
                    className={`ob-step-dot ${
                      s === step ? "active" : s < step ? "completed" : ""
                    }`}
                  />
                ))}
              </div>
              <div className="ob-progress-label">
                Step {step} of {TOTAL_STEPS} — {stepLabels[step - 1]}
              </div>
            </div>
          )}

          {/* ═══════ STEP 1: Basic Signup ═══════ */}
          {step === 1 && (
            <div className="ob-card ob-step-enter" key="step1">
              <h1 className="ob-heading">
                Welcome to <span className="ob-heading-accent">Vaulto</span>
              </h1>
              <p className="ob-subheading">
                Create your account and start saving on every transfer.
              </p>

              <div className="ob-field">
                <label className="ob-field-label" htmlFor="signup-name">
                  Full name
                </label>
                <input
                  id="signup-name"
                  className={`ob-input ${errors.name ? "error" : ""}`}
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setErrors((p) => ({ ...p, name: undefined }));
                  }}
                  autoFocus
                />
                {errors.name && (
                  <div className="ob-field-error">{errors.name}</div>
                )}
              </div>

              <div className="ob-field">
                <label className="ob-field-label" htmlFor="signup-email">
                  Email address
                </label>
                <input
                  id="signup-email"
                  className={`ob-input ${errors.email ? "error" : ""}`}
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrors((p) => ({ ...p, email: undefined }));
                  }}
                />
                {errors.email && (
                  <div className="ob-field-error">{errors.email}</div>
                )}
              </div>

              <div className="ob-field">
                <label className="ob-field-label" htmlFor="signup-password">
                  Password
                </label>
                <div className="ob-password-wrapper">
                  <input
                    id="signup-password"
                    className={`ob-input ${errors.password ? "error" : ""}`}
                    type={showPw ? "text" : "password"}
                    placeholder="Min. 8 characters"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrors((p) => ({ ...p, password: undefined }));
                    }}
                  />
                  <button
                    type="button"
                    className="ob-password-toggle"
                    onClick={() => setShowPw(!showPw)}
                    aria-label={showPw ? "Hide password" : "Show password"}
                  >
                    {showPw ? "🙈" : "👁"}
                  </button>
                </div>
                {errors.password && (
                  <div className="ob-field-error">{errors.password}</div>
                )}

                {/* Password strength meter */}
                {password && (
                  <>
                    <div className="ob-strength-bar">
                      {[1, 2, 3].map((seg) => (
                        <div
                          key={seg}
                          className={`ob-strength-segment ${
                            seg <= pwStrength.segments ? pwStrength.level : ""
                          }`}
                        />
                      ))}
                    </div>
                    <div className={`ob-strength-label ${pwStrength.level}`}>
                      {pwStrength.label}
                    </div>
                  </>
                )}
              </div>

              <div className="ob-btn-row">
                <button
                  className="ob-btn-primary"
                  onClick={handleContinue}
                  type="button"
                  id="signup-continue"
                >
                  Continue →
                </button>
              </div>

              <div className="ob-footer">
                Already have an account? <a href="#">Sign in</a>
              </div>

              <div className="ob-trust">
                <div className="ob-trust-item">
                  <span>🔒</span> 256-bit encryption
                </div>
                <div className="ob-trust-item">
                  <span>🛡️</span> No data selling
                </div>
                <div className="ob-trust-item">
                  <span>⚡</span> Free forever
                </div>
              </div>
            </div>
          )}

          {/* ═══════ STEP 2: Personalization ═══════ */}
          {step === 2 && (
            <div className="ob-card ob-step-enter" key="step2">
              <h2 className="ob-heading">
                Where are you <span className="ob-heading-accent">studying</span>?
              </h2>
              <p className="ob-subheading">
                This helps us show you the most relevant transfer routes and rates.
              </p>

              <div className="ob-field">
                <label className="ob-field-label" htmlFor="signup-country">
                  Destination country
                </label>
                <SearchableDropdown
                  id="signup-country"
                  items={countryItems}
                  value={selectedCountry ? selectedCountry.name : null}
                  onChange={(item) => {
                    const fullCountry = COUNTRIES.find(
                      (c) => c.code === item.code
                    );
                    setSelectedCountry(fullCountry);
                    setSelectedUniversity(null);
                    setErrors((p) => ({ ...p, country: undefined }));
                  }}
                  placeholder="Search or select a country…"
                />
                {errors.country && (
                  <div className="ob-field-error">{errors.country}</div>
                )}
                {selectedCountry && (
                  <div className="ob-selected-tag">
                    {selectedCountry.flag} {selectedCountry.name}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCountry(null);
                        setSelectedUniversity(null);
                      }}
                      aria-label="Clear country"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>

              {selectedCountry && (
                <div className="ob-field" style={{ animation: "ob-slide-in 0.35s ease both" }}>
                  <label className="ob-field-label" htmlFor="signup-university">
                    Your university
                  </label>
                  <SearchableDropdown
                    id="signup-university"
                    items={universityItems}
                    value={
                      selectedUniversity ? selectedUniversity.name : null
                    }
                    onChange={(item) => {
                      setSelectedUniversity(item);
                      setErrors((p) => ({ ...p, university: undefined }));
                    }}
                    placeholder="Search for your university…"
                  />
                  {errors.university && (
                    <div className="ob-field-error">{errors.university}</div>
                  )}
                  {selectedUniversity && (
                    <div className="ob-selected-tag">
                      🏫 {selectedUniversity.name}
                      {selectedUniversity.city &&
                        ` — ${selectedUniversity.city}`}
                      <button
                        type="button"
                        onClick={() => setSelectedUniversity(null)}
                        aria-label="Clear university"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="ob-btn-row">
                <button
                  className="ob-btn-secondary"
                  onClick={goBack}
                  type="button"
                >
                  ← Back
                </button>
                <button
                  className="ob-btn-primary"
                  onClick={handleContinue}
                  type="button"
                  id="personalization-continue"
                >
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* ═══════ STEP 3: Smart Preferences ═══════ */}
          {step === 3 && (
            <div className="ob-card ob-step-enter" key="step3">
              <h2 className="ob-heading">
                What matters <span className="ob-heading-accent">most</span> to you?
              </h2>
              <p className="ob-subheading">
                Pick one or more — we&rsquo;ll tailor your comparisons
                accordingly.
              </p>

              <div className="ob-pref-grid">
                <button
                  type="button"
                  className={`ob-pref-card ${
                    preferences.includes("fees") ? "selected" : ""
                  }`}
                  onClick={() => togglePref("fees")}
                  id="pref-fees"
                >
                  <div className="ob-pref-icon fees">💰</div>
                  <div className="ob-pref-info">
                    <div className="ob-pref-title">Lowest fees</div>
                    <div className="ob-pref-desc">
                      Minimize transfer costs
                    </div>
                  </div>
                  <div className="ob-pref-check">✓</div>
                </button>

                <button
                  type="button"
                  className={`ob-pref-card ${
                    preferences.includes("rate") ? "selected" : ""
                  }`}
                  onClick={() => togglePref("rate")}
                  id="pref-rate"
                >
                  <div className="ob-pref-icon rate">📈</div>
                  <div className="ob-pref-info">
                    <div className="ob-pref-title">Best exchange rate</div>
                    <div className="ob-pref-desc">
                      Get more for your money
                    </div>
                  </div>
                  <div className="ob-pref-check">✓</div>
                </button>

                <button
                  type="button"
                  className={`ob-pref-card ${
                    preferences.includes("speed") ? "selected" : ""
                  }`}
                  onClick={() => togglePref("speed")}
                  id="pref-speed"
                >
                  <div className="ob-pref-icon speed">⚡</div>
                  <div className="ob-pref-info">
                    <div className="ob-pref-title">Fastest transfer</div>
                    <div className="ob-pref-desc">
                      Money arrives ASAP
                    </div>
                  </div>
                  <div className="ob-pref-check">✓</div>
                </button>
              </div>

              <div className="ob-btn-row">
                <button
                  className="ob-btn-secondary"
                  onClick={goBack}
                  type="button"
                >
                  ← Back
                </button>
                <button
                  className="ob-btn-primary"
                  onClick={handleContinue}
                  type="button"
                  id="preferences-continue"
                >
                  {preferences.length > 0
                    ? "Continue →"
                    : "Continue →"}
                </button>
              </div>
              <button
                className="ob-btn-skip"
                onClick={goNext}
                type="button"
              >
                Skip this step
              </button>
            </div>
          )}

          {/* ═══════ STEP 4: WhatsApp Integration ═══════ */}
          {step === 4 && (
            <div className="ob-card ob-step-enter" key="step4">
              <h2 className="ob-heading">
                Get <span className="ob-heading-accent">rate alerts</span> on
                WhatsApp
              </h2>
              <p className="ob-subheading">
                We&rsquo;ll notify you when exchange rates improve for your
                corridor. Never miss a good rate again.
              </p>

              <div className="ob-whatsapp-banner">
                <span className="ob-whatsapp-icon">💬</span>
                <div className="ob-whatsapp-text">
                  <strong>Smart rate alerts —</strong> We monitor rates 24/7 and
                  send you a WhatsApp message when it&rsquo;s the best time to
                  transfer. Typically saves users 2-4% per transfer.
                </div>
              </div>

              <div className="ob-field">
                <label className="ob-field-label" htmlFor="signup-phone">
                  WhatsApp number
                  <span className="ob-optional-badge">Optional</span>
                </label>
                <div className="ob-phone-row">
                  <div className="ob-phone-code">
                    <select
                      id="signup-phone-code"
                      value={phoneCode}
                      onChange={(e) => setPhoneCode(e.target.value)}
                    >
                      {PHONE_CODES.map((pc) => (
                        <option key={`${pc.flag}-${pc.code}-${pc.country}`} value={pc.code}>
                          {pc.flag} {pc.code}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="ob-phone-number">
                    <input
                      id="signup-phone"
                      className="ob-input"
                      type="tel"
                      placeholder="Your phone number"
                      value={phoneNumber}
                      onChange={(e) =>
                        setPhoneNumber(e.target.value.replace(/[^\d\s()-]/g, ""))
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="ob-btn-row">
                <button
                  className="ob-btn-secondary"
                  onClick={goBack}
                  type="button"
                >
                  ← Back
                </button>
                <button
                  className="ob-btn-primary"
                  onClick={handleContinue}
                  type="button"
                  id="whatsapp-continue"
                >
                  {phoneNumber
                    ? "Complete Setup →"
                    : "Complete Setup →"}
                </button>
              </div>
              <button
                className="ob-btn-skip"
                onClick={goNext}
                type="button"
              >
                Skip — I&rsquo;ll do this later
              </button>
            </div>
          )}

          {/* ═══════ STEP 5: Completion ═══════ */}
          {step > TOTAL_STEPS && (
            <div className="ob-card" key="step-done">
              <div className="ob-success">
                <div className="ob-success-icon">🚀</div>
                <h2>
                  You&rsquo;re all set,{" "}
                  <span className="ob-heading-accent">
                    {name.split(" ")[0] || "there"}
                  </span>
                  !
                </h2>
                <p>
                  Your Vaulto account is ready. We&rsquo;ve configured
                  everything based on your preferences
                  {selectedCountry &&
                    ` for transfers to ${selectedCountry.name}`}
                  .
                </p>

                <div className="ob-features-grid">
                  <div className="ob-feature-item">
                    <span>📊</span> Live rate comparison
                  </div>
                  <div className="ob-feature-item">
                    <span>🔔</span> Smart alerts
                  </div>
                  <div className="ob-feature-item">
                    <span>💡</span> Personalized picks
                  </div>
                  <div className="ob-feature-item">
                    <span>🏦</span> 3+ providers
                  </div>
                </div>

                <button
                  className="ob-btn-primary"
                  onClick={() => router.push("/")}
                  type="button"
                  id="start-comparing"
                  style={{ width: "100%" }}
                >
                  Start Comparing Rates →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
