import { getAccessToken } from "@/lib/api/auth";

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";
const authHeaders = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${getAccessToken() ?? ""}` });

export async function getSubscription() {
  const response = await fetch(`${API}/api/v1/subscriptions/me`, { headers: authHeaders() });
  if (!response.ok) throw new Error(response.status === 401 ? "로그인이 필요합니다." : "구독 정보를 불러오지 못했습니다.");
  return response.json() as Promise<{ plan: string; status: string; is_plus: boolean; features: string[] }>;
}

export async function createCheckout() {
  const response = await fetch(`${API}/api/v1/payments/checkout`, { method: "POST", headers: authHeaders() });
  if (!response.ok) throw new Error("결제 준비 상태를 확인하지 못했습니다.");
  return response.json() as Promise<{ status: string; message: string }>;
}

export async function getRecommendations() {
  const response = await fetch(`${API}/api/v1/recommendations`, { headers: authHeaders() });
  if (!response.ok) throw new Error(response.status === 403 ? "EasyLife Plus 구독이 필요한 기능입니다." : "추천을 불러오지 못했습니다.");
  return response.json() as Promise<Array<{ service: { id: number; name: string; category: string; description: string }; score: number; reason: string; sponsored: boolean }>>;
}
