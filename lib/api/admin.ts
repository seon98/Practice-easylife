import { getAccessToken } from "@/lib/api/auth";
import type { Service } from "@/types/service";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";
export type ServiceInput = Omit<Service, "id">;

async function request(path: string, init: RequestInit): Promise<Service | null> {
  const token = getAccessToken();
  const response = await fetch(`${BASE_URL}/api/v1/admin/services${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...init.headers },
  });
  if (!response.ok) throw new Error(response.status === 403 ? "관리자 권한이 필요합니다." : "관리 요청에 실패했습니다.");
  return response.status === 204 ? null : response.json() as Promise<Service>;
}

export const createService = (data: ServiceInput) => request("", { method: "POST", body: JSON.stringify(data) });
export const updateService = (id: number, data: Partial<ServiceInput>) => request(`/${id}`, { method: "PATCH", body: JSON.stringify(data) });
export const deleteService = (id: number) => request(`/${id}`, { method: "DELETE" });
