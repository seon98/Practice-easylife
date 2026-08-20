"use client";

import Link from "next/link";

import ServiceCard from "@/components/ServiceCard";
import { useFavorites } from "@/hooks/useFavorites";
import type { Service } from "@/types/service";

interface FavoriteServicesProps {
  services: Service[];
}

export default function FavoriteServices({
  services,
}: FavoriteServicesProps) {
  const {
    favoriteIds,
    toggleFavorite,
    isFavorite,
    isHydrated,
  } = useFavorites();

  /**
   * 전체 서비스 중에서
   * 즐겨찾기 ID에 포함된 서비스만 추출합니다.
   */
  const favoriteServices = services.filter(
    (service) =>
      favoriteIds.includes(service.id),
  );

  /**
   * 서버 렌더링과 브라우저 hydration 사이에서
   * localStorage 값 차이로 인한 UI 불일치를 방지합니다.
   */
  if (!isHydrated) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm text-gray-500">
          즐겨찾기를 불러오는 중입니다...
        </p>
      </div>
    );
  }

  /**
   * 즐겨찾기가 하나도 없는 경우
   */
  if (favoriteServices.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
        <div
          className="text-4xl"
          aria-hidden="true"
        >
          ☆
        </div>

        <h2 className="mt-4 text-lg font-semibold text-gray-900">
          즐겨찾기가 없습니다.
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          마음에 드는 서비스를
          즐겨찾기에 추가해 보세요.
        </p>

        <Link
          href="/services"
          className="mt-6 inline-flex rounded-xl bg-gray-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-700"
        >
          서비스 둘러보기
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* 즐겨찾기 개수 */}
      <div className="mb-6">
        <p
          className="text-sm text-gray-500"
          aria-live="polite"
        >
          즐겨찾기{" "}
          <strong className="font-semibold text-gray-900">
            {favoriteServices.length}
          </strong>
          개
        </p>
      </div>

      {/* 즐겨찾기 서비스 */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {favoriteServices.map(
          (service) => (
            <ServiceCard
              key={service.id}
              service={service}
              isFavorite={isFavorite(
                service.id,
              )}
              onToggleFavorite={
                toggleFavorite
              }
            />
          ),
        )}
      </div>
    </>
  );
}