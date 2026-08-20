import Link from "next/link";
import { notFound } from "next/navigation";

import { services } from "@/data/services";

interface ServiceDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

/**
 * 현재 서비스 데이터가 정적 데이터이므로
 * 빌드할 때 상세 페이지 경로를 미리 생성합니다.
 */
export function generateStaticParams() {
  return services.map((service) => ({
    id: String(service.id),
  }));
}

export default async function ServiceDetailPage({
  params,
}: ServiceDetailPageProps) {
  const { id } = await params;

  const serviceId = Number(id);

  const service = services.find(
    (item) => item.id === serviceId,
  );

  // 존재하지 않는 서비스라면 404 처리
  if (!service) {
    notFound();
  }

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-6 py-12">
      {/* 이전 페이지 */}
      <Link
        href="/services"
        className="text-sm font-medium text-gray-500 hover:text-gray-950"
      >
        ← 전체 서비스
      </Link>

      <article className="mt-8 rounded-3xl border border-gray-200 bg-white p-8 shadow-sm sm:p-10">
        <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-600">
          {service.category}
        </span>

        <h1 className="mt-5 text-4xl font-bold tracking-tight text-gray-950">
          {service.name}
        </h1>

        <p className="mt-6 text-lg leading-8 text-gray-600">
          {service.description}
        </p>

        <div className="mt-10 border-t border-gray-200 pt-8">
          <h2 className="text-lg font-semibold text-gray-950">
            서비스 이용
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            아래 버튼을 누르면 공식 서비스 사이트가 새 창에서 열립니다.
          </p>

          <a
            href={service.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex rounded-xl bg-gray-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-700"
          >
            {service.name} 바로가기 →
          </a>
        </div>
      </article>
    </main>
  );
}