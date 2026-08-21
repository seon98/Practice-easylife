import { cache } from "react";
import { unstable_rethrow } from "next/navigation";

import type { Service } from "@/types/service";

const API_BASE_URL =
  process.env.API_BASE_URL ?? "http://127.0.0.1:8000";

export async function getServices(): Promise<Service[]> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/api/v1/services`, {
      cache: "no-store",
    });
  } catch (error) {
    unstable_rethrow(error);

    throw new Error("Failed to fetch services from API", {
      cause: error,
    });
  }

  if (!response.ok) {
    throw new Error("Failed to fetch services from API");
  }

  return (await response.json()) as Service[];
}

async function fetchService(
  serviceId: number,
): Promise<Service | null> {
  let response: Response;

  try {
    response = await fetch(
      `${API_BASE_URL}/api/v1/services/${serviceId}`,
      {
        cache: "no-store",
      },
    );
  } catch (error) {
    unstable_rethrow(error);

    throw new Error("Failed to fetch service from API", {
      cause: error,
    });
  }

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Failed to fetch service from API");
  }

  return (await response.json()) as Service;
}

export const getService = cache(fetchService);
