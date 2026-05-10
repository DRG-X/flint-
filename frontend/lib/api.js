const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ── Auth helper ────────────────────────────────────────────────────────────────

function authHeaders(token) {
  return { "Authorization": `Bearer ${token}` };
}

async function handleResponse(res) {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    const errorObj = new Error(err.detail || "API request failed");
    errorObj.status = res.status;
    throw errorObj;
  }
  return res.json();
}

// ── User status / legacy ───────────────────────────────────────────────────────

/** Quick check: does this user have a saved profile? */
export async function checkUserStatus(token) {
  const res = await fetch(`${API_URL}/user/status`, {
    headers: authHeaders(token),
  });
  return handleResponse(res);
}

export async function getUserProfile(token) {
  const res = await fetch(`${API_URL}/user/profile`, {
    headers: authHeaders(token),
  });
  return handleResponse(res);
}

export async function createUserProfile(token, data) {
  const res = await fetch(`${API_URL}/user/profile`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

// ── Compare (legacy — used by index.js) ───────────────────────────────────────

export async function compareProviders({ amount, currency_from, currency_to }) {
  const res = await fetch(`${API_URL}/compare`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount: parseFloat(amount), currency_from, currency_to }),
  });
  return handleResponse(res);
}

// ── /api/users ─────────────────────────────────────────────────────────────────

/** Upsert user row after Clerk sign-in/sign-up */
export async function syncUser(token, { clerk_id, email, full_name }) {
  const res = await fetch(`${API_URL}/api/users/sync`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify({ clerk_id, email, full_name }),
  });
  return handleResponse(res);
}

/** GET /api/users/me — returns full user row */
export async function getMe(token) {
  const res = await fetch(`${API_URL}/api/users/me`, {
    headers: authHeaders(token),
  });
  return handleResponse(res);
}

/** PATCH /api/users/me — partial update */
export async function updateMe(token, data) {
  const res = await fetch(`${API_URL}/api/users/me`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

// ── /api/onboarding ────────────────────────────────────────────────────────────

export async function completeOnboarding(token, data) {
  const res = await fetch(`${API_URL}/api/onboarding/complete`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

// ── /api/rates ─────────────────────────────────────────────────────────────────

export async function getRates({ from, to, amount }) {
  const params = new URLSearchParams({ from, to, amount: String(amount) });
  const res = await fetch(`${API_URL}/api/rates?${params}`);
  return handleResponse(res);
}

// ── /api/comparisons ───────────────────────────────────────────────────────────

export async function saveComparison(token, data) {
  const res = await fetch(`${API_URL}/api/comparisons`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function listComparisons(token, { page = 1, limit = 20 } = {}) {
  const params = new URLSearchParams({ page, limit });
  const res = await fetch(`${API_URL}/api/comparisons?${params}`, {
    headers: authHeaders(token),
  });
  return handleResponse(res);
}

// ── /api/alerts ────────────────────────────────────────────────────────────────

export async function createAlert(token, data) {
  const res = await fetch(`${API_URL}/api/alerts`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function listAlerts(token) {
  const res = await fetch(`${API_URL}/api/alerts`, {
    headers: authHeaders(token),
  });
  return handleResponse(res);
}

export async function updateAlert(token, id, data) {
  const res = await fetch(`${API_URL}/api/alerts/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function deleteAlert(token, id) {
  const res = await fetch(`${API_URL}/api/alerts/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    const errorObj = new Error(err.detail || "Delete failed");
    errorObj.status = res.status;
    throw errorObj;
  }
  // 204 No Content — no body
}

export async function submitContactForm(data) {
  const res = await fetch(`${API_URL}/api/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}
