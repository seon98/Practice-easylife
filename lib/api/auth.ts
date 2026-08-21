import type { AuthResponse, User } from "@/types/auth";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";
const TOKEN_KEY = "easylife-access-token";

export const getAccessToken = () => typeof window === "undefined" ? null : localStorage.getItem(TOKEN_KEY);
export const saveAccessToken = (token: string) => localStorage.setItem(TOKEN_KEY, token);
export const clearAccessToken = () => localStorage.removeItem(TOKEN_KEY);

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null) as { detail?: string } | null;
    throw new Error(body?.detail ?? "요청을 처리하지 못했습니다.");
  }
  return response.json() as Promise<T>;
}

export function signup(email: string, password: string): Promise<AuthResponse> {
  return request("/api/v1/auth/signup", { method: "POST", body: JSON.stringify({ email, password }) });
}

export function login(email: string, password: string, clientId: string | null): Promise<AuthResponse> {
  return request("/api/v1/auth/login", {
    method: "POST",
    headers: clientId ? { "X-Client-ID": clientId } : undefined,
    body: JSON.stringify({ email, password }),
  });
}

export function getMe(token: string): Promise<User> {
  return request("/api/v1/auth/me", { headers: { Authorization: `Bearer ${token}` } });
}
