import { getAccessToken } from "@/lib/api/auth";
import type { Guide } from "@/types/monetization";
const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";
const headers = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${getAccessToken() ?? ""}` });
async function request<T>(path: string, init: RequestInit = {}): Promise<T> { const response = await fetch(`${API}${path}`, { ...init, headers: { ...headers(), ...init.headers } }); if (!response.ok) throw new Error("관리자 요청에 실패했습니다."); return response.json() as Promise<T>; }
export const getAdminGuides = () => request<Guide[]>("/api/v1/admin/guides");
export const createAdminGuide = (payload: object) => request<Guide>("/api/v1/admin/guides", { method: "POST", body: JSON.stringify(payload) });
export const getRevenueSummary = () => request<Record<string, unknown>>("/api/v1/admin/revenue/summary");
export const getAnalyticsSummary = () => request<Record<string, unknown>>("/api/v1/admin/analytics/summary");
