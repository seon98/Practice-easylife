"use client";

import { useCallback, useEffect, useState } from "react";

import { addFavorite, getFavorites, removeFavorite } from "@/lib/api/favorites";

const EVENT = "easylife:favorites-changed";

export function useFavorites() {
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setFavoriteIds(await getFavorites());
      setError(null);
    } catch {
      setError("즐겨찾기를 불러오지 못했습니다.");
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => void refresh());
    const handler = () => void refresh();
    window.addEventListener(EVENT, handler);
    return () => window.removeEventListener(EVENT, handler);
  }, [refresh]);

  const toggleFavorite = useCallback(async (serviceId: number) => {
    const wasFavorite = favoriteIds.includes(serviceId);
    setFavoriteIds((current) => wasFavorite ? current.filter((id) => id !== serviceId) : [...current, serviceId]);
    try {
      await (wasFavorite ? removeFavorite(serviceId) : addFavorite(serviceId));
      window.dispatchEvent(new Event(EVENT));
    } catch {
      setError("즐겨찾기를 변경하지 못했습니다.");
      await refresh();
    }
  }, [favoriteIds, refresh]);

  return {
    favoriteIds,
    toggleFavorite: (id: number) => void toggleFavorite(id),
    isFavorite: (id: number) => favoriteIds.includes(id),
    isHydrated,
    error,
  };
}
