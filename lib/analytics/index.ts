import type { AnalyticsEventName } from "@/types/monetization";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

function clientId(): string {
  const key = "easylife_analytics_id";
  const current = localStorage.getItem(key);
  if (current) return current;
  const created = crypto.randomUUID(); localStorage.setItem(key, created); return created;
}

export function trackEvent(event_name: AnalyticsEventName, data: { service_id?: number; guide_id?: number; metadata?: Record<string, string | number | boolean> } = {}): void {
  if (typeof window === "undefined") return;
  const body = JSON.stringify({ event_name, client_id: clientId(), ...data });
  if (navigator.sendBeacon) { navigator.sendBeacon(`${API_BASE_URL}/api/v1/analytics/events`, new Blob([body], { type: "application/json" })); return; }
  void fetch(`${API_BASE_URL}/api/v1/analytics/events`, { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true });
}
