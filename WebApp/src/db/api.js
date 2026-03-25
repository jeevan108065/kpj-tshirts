const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

function getToken() {
  return sessionStorage.getItem("kpj_admin_token") || "";
}

async function request(path, options = {}, _retry = 0) {
  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
        ...options.headers,
      },
    });
  } catch (networkErr) {
    // Render free tier cold start — retry once after a short delay
    if (_retry < 2) {
      await new Promise((r) => setTimeout(r, 3000));
      return request(path, options, _retry + 1);
    }
    throw new Error("Cannot connect to server. Is the API running on " + API_BASE + "?");
  }
  if (res.status === 401) {
    sessionStorage.removeItem("kpj_admin");
    sessionStorage.removeItem("kpj_admin_token");
    const err = new Error("Session expired. Please login again.");
    err.status = 401;
    throw err;
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || "Request failed");
  }
  return res.json();
}

// Auth
export const login = (password) => request("/api/auth/login", { method: "POST", body: JSON.stringify({ password }) });

// Metrics (public)
export const getMetrics = () => request("/api/metrics");

// Helper to build query string from params object
function qs(params = {}) {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) { if (v !== undefined && v !== null && v !== "") p.set(k, v); }
  const s = p.toString();
  return s ? `?${s}` : "";
}

// Categories
export const getCategories = (params) => request(`/api/categories${qs(params)}`);
export const createCategory = (data) => request("/api/categories", { method: "POST", body: JSON.stringify(data) });
export const updateCategory = (id, data) => request(`/api/categories/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteCategory = (id) => request(`/api/categories/${id}`, { method: "DELETE" });

// Payment Methods
export const getPaymentMethods = (params) => request(`/api/payment-methods${qs(params)}`);
export const createPaymentMethod = (data) => request("/api/payment-methods", { method: "POST", body: JSON.stringify(data) });
export const updatePaymentMethod = (id, data) => request(`/api/payment-methods/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deletePaymentMethod = (id) => request(`/api/payment-methods/${id}`, { method: "DELETE" });

// Products / Inventory
export const getProducts = (params) => request(`/api/products${qs(params)}`);
export const createProduct = (data) => request("/api/products", { method: "POST", body: JSON.stringify(data) });
export const updateProduct = (id, data) => request(`/api/products/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteProduct = (id) => request(`/api/products/${id}`, { method: "DELETE" });

// Leads
export const getLeads = (params) => request(`/api/leads${qs(params)}`);
export const createLead = (data) => request("/api/leads", { method: "POST", body: JSON.stringify(data) });
export const updateLead = (id, data) => request(`/api/leads/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteLead = (id) => request(`/api/leads/${id}`, { method: "DELETE" });

// Quotes / Invoices (tax invoices)
export const getQuotes = (params) => request(`/api/quotes${qs(params)}`);
export const getNextQuoteNumber = (type) => request(`/api/quotes/next-number`);
export const createQuote = (data) => request("/api/quotes", { method: "POST", body: JSON.stringify(data) });
export const updateQuote = (id, data) => request(`/api/quotes/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteQuote = (id) => request(`/api/quotes/${id}`, { method: "DELETE" });

// Sample Quotes (separate table)
export const getSampleQuotes = (params) => request(`/api/sample-quotes${qs(params)}`);
export const getNextSampleQuoteNumber = () => request(`/api/sample-quotes/next-number`);
export const createSampleQuote = (data) => request("/api/sample-quotes", { method: "POST", body: JSON.stringify(data) });
export const updateSampleQuote = (id, data) => request(`/api/sample-quotes/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const convertSampleQuote = (id) => request(`/api/sample-quotes/${id}/convert`, { method: "POST", body: JSON.stringify({}) });
export const deleteSampleQuote = (id) => request(`/api/sample-quotes/${id}`, { method: "DELETE" });

// Orders
export const getOrders = (params) => request(`/api/orders${qs(params)}`);
export const createOrder = (data) => request("/api/orders", { method: "POST", body: JSON.stringify(data) });
export const updateOrder = (id, data) => request(`/api/orders/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteOrder = (id) => request(`/api/orders/${id}`, { method: "DELETE" });

// Reviews (public) — safe fetchers that never throw, return fallbacks on failure
export async function getReviews() {
  try {
    const res = await fetch(`${API_BASE}/api/reviews`);
    if (!res.ok) { console.warn("getReviews: server returned", res.status); return []; }
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) { console.warn("getReviews: failed to fetch reviews", err.message); return []; }
}
export async function submitReview(data) {
  const res = await fetch(`${API_BASE}/api/reviews`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
  if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.error || "Failed to submit review"); }
  return res.json();
}
