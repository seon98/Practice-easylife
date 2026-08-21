import Link from "next/link";

import type { Service } from "@/types/service";
import TrackedServiceLink from "@/components/TrackedServiceLink";

interface ServiceCardProps {
  service: Service;
  isFavorite: boolean;
  onToggleFavorite: (
    serviceId: number,
  ) => void;
}

export default function ServiceCard({
  service,
  isFavorite,
  onToggleFavorite,
}: ServiceCardProps) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      {/* 카테고리 + 즐겨찾기 */}
      <div className="flex items-start justify-between gap-4">
        <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
          {service.category}
        </span>

        <button
          type="button"
          onClick={() =>
            onToggleFavorite(service.id)
          }
          aria-pressed={isFavorite}
          aria-label={
            isFavorite
              ? `${service.name} 즐겨찾기 해제`
              : `${service.name} 즐겨찾기 추가`
          }
          className="text-2xl transition hover:scale-110"
        >
          {isFavorite ? "★" : "☆"}
        </button>
      </div>

      {/* 서비스 이름 */}
      <h2 className="mt-4 text-xl font-bold text-gray-900">
        {service.name}
      </h2>

      {/* 서비스 설명 */}
      <p className="mt-3 flex-1 text-sm leading-6 text-gray-600">
        {service.description}
      </p>

      {/* 링크 */}
      <div className="mt-6 flex items-center justify-between gap-4">
        <Link
          href={`/services/${service.id}`}
          className="text-sm font-semibold text-gray-900 hover:underline"
        >
          상세보기 →
        </Link>

        <TrackedServiceLink
          id={service.id}
          href={service.url}
          className="text-sm text-gray-500 hover:text-gray-950 hover:underline"
        >
          공식 사이트
        </TrackedServiceLink>
      </div>
    </article>
  );
}
