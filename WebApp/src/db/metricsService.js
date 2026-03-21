// Public metrics fetcher — tries API first, falls back to localStorage, then defaults
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

export async function fetchMetrics() {
  try {
    const res = await fetch(`${API_BASE}/api/metrics`);
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem("kpj_metrics", JSON.stringify(data));
      return data;
    }
  } catch {
    // API unavailable, fall through
  }
  return getMetrics();
}

export function getMetrics() {
  try {
    const stored = localStorage.getItem("kpj_metrics");
    if (stored) return JSON.parse(stored);
  } catch {
    // ignore
  }
  return {
    tshirtsDelivered: 0,
    happyClients: 0,
    expressDelivery: "48hr",
    satisfactionRate: "100%",
  };
}
