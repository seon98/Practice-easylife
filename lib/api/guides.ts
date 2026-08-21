import { cache } from "react";

import type { Guide } from "@/types/monetization";

const API_BASE_URL = process.env.API_BASE_URL ?? "http://127.0.0.1:8000";

export async function getGuides(): Promise<Guide[]> {
  const response = await fetch(`${API_BASE_URL}/api/v1/guides`, { next: { revalidate: 300 } });
  if (!response.ok) throw new Error("Failed to fetch guides");
  return response.json() as Promise<Guide[]>;
}

export const getGuide = cache(async (slug: string): Promise<Guide | null> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/guides/${encodeURIComponent(slug)}`, { next: { revalidate: 300 } });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error("Failed to fetch guide");
  return response.json() as Promise<Guide>;
});
