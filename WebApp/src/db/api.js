const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

function getToken() {
  return sessionStorage.getItem("kpj_admin_token") || "";
}

async function request(path, options = {}) {
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
    throw new Error("Cannot connect to server. Is the API running on " + API_BASE + "?");
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

// Categories
export const getCategories = () => request("/api/categories");
export const createCategory = (data) => request("/api/categories", { method: "POST", body: JSON.stringify(data) });
export const updateCategory = (id, data) => request(`/api/categories/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteCategory = (id) => request(`/api/categories/${id}`, { method: "DELETE" });

// Payment Methods
export const getPaymentMethods = () => request("/api/payment-methods");
export const createPaymentMethod = (data) => request("/api/payment-methods", { method: "POST", body: JSON.stringify(data) });
export const updatePaymentMethod = (id, data) => request(`/api/payment-methods/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deletePaymentMethod = (id) => request(`/api/payment-methods/${id}`, { method: "DELETE" });

// Products / Inventory
export const getProducts = () => request("/api/products");
export const createProduct = (data) => request("/api/products", { method: "POST", body: JSON.stringify(data) });
export const updateProduct = (id, data) => request(`/api/products/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteProduct = (id) => request(`/api/products/${id}`, { method: "DELETE" });

// Leads
export const getLeads = () => request("/api/leads");
export const createLead = (data) => request("/api/leads", { method: "POST", body: JSON.stringify(data) });
export const updateLead = (id, data) => request(`/api/leads/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteLead = (id) => request(`/api/leads/${id}`, { method: "DELETE" });

// Quotes / Invoices
export const getQuotes = () => request("/api/quotes");
export const getNextQuoteNumber = (type) => request(`/api/quotes/next-number?type=${type || "tax_invoice"}`);
export const createQuote = (data) => request("/api/quotes", { method: "POST", body: JSON.stringify(data) });
export const updateQuote = (id, data) => request(`/api/quotes/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const convertQuote = (id, data) => request(`/api/quotes/${id}/convert`, { method: "POST", body: JSON.stringify(data) });
export const deleteQuote = (id) => request(`/api/quotes/${id}`, { method: "DELETE" });

// Orders
export const getOrders = () => request("/api/orders");
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
