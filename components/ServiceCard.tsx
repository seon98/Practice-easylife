import type { Service } from "@/types/service";

interface ServiceCardProps {
  service: Service;
}

export default function ServiceCard({ service }: ServiceCardProps) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      {/* 서비스 카테고리 */}
      <div>
        <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
          {service.category}
        </span>
      </div>

      {/* 서비스 이름 */}
      <h2 className="mt-4 text-xl font-bold text-gray-900">
        {service.name}
      </h2>

      {/* 서비스 설명 */}
      <p className="mt-3 flex-1 text-sm leading-6 text-gray-600">
        {service.description}
      </p>

      {/* 외부 서비스 이동 */}
      <a
        href={service.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 inline-flex items-center text-sm font-semibold text-gray-900 hover:underline"
      >
        서비스 바로가기
        <span aria-hidden="true" className="ml-1">
          →
        </span>
      </a>
    </article>
  );
}