import { getAccessToken } from "@/lib/api/auth";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";
export const CLIENT_ID_KEY = "easylife-client-id";

interface Favorite { service_id: number }

export function getClientId(): string {
  let id = localStorage.getItem(CLIENT_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(CLIENT_ID_KEY, id);
  }
  return id;
}

function headers(): HeadersInit {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : { "X-Client-ID": getClientId() };
}

async function favoriteRequest(path = "", method = "GET"): Promise<Response> {
  const response = await fetch(`${BASE_URL}/api/v1/favorites${path}`, { method, headers: headers() });
  if (!response.ok) throw new Error("즐겨찾기 요청을 처리하지 못했습니다.");
  return response;
}

export async function getFavorites(): Promise<number[]> {
  const response = await favoriteRequest();
  const items = await response.json() as Favorite[];
  return items.map((item) => item.service_id);
}

export async function addFavorite(serviceId: number): Promise<void> {
  await favoriteRequest(`/${serviceId}`, "POST");
}

export async function removeFavorite(serviceId: number): Promise<void> {
  await favoriteRequest(`/${serviceId}`, "DELETE");
}
