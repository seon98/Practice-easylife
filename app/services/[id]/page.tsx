import type { Metadata } from "next";
import { notFound } from "next/navigation";

import Breadcrumb from "@/components/Breadcrumb";
import { getService } from "@/lib/api/services";

interface ServiceDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({
  params,
}: ServiceDetailPageProps): Promise<Metadata> {
  const { id } = await params;

  const serviceId = Number(id);

  if (!Number.isSafeInteger(serviceId) || serviceId <= 0) {
    return {
      title: "서비스를 찾을 수 없습니다",
    };
  }

  const service = await getService(serviceId);

  if (!service) {
    return {
      title: "서비스를 찾을 수 없습니다",
    };
  }

  return {
    title: service.name,
    description: service.description,
  };
}

export default async function ServiceDetailPage({
  params,
}: ServiceDetailPageProps) {
  const { id } = await params;

  const serviceId = Number(id);

  if (!Number.isSafeInteger(serviceId) || serviceId <= 0) {
    notFound();
  }

  const service = await getService(serviceId);

  if (!service) {
    notFound();
  }

  return (
    <main className="mx-auto min-h-[70vh] max-w-4xl px-6 py-10 sm:py-14 lg:px-8">
      <Breadcrumb
        items={[
          {
            label: "홈",
            href: "/",
          },
          {
            label: "서비스",
            href: "/services",
          },
          {
            label: service.name,
          },
        ]}
      />

      <article className="mt-8 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
        {/* 상세 헤더 */}
        <div className="p-7 sm:p-10">
          <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-600">
            {service.category}
          </span>

          <h1 className="mt-5 text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">
            {service.name}
          </h1>

          <p className="mt-5 text-base leading-8 text-gray-600 sm:text-lg">
            {service.description}
          </p>
        </div>

        {/* 이용 영역 */}
        <div className="border-t border-gray-200 bg-gray-50 p-7 sm:p-10">
          <h2 className="text-lg font-semibold text-gray-950">
            서비스 이용하기
          </h2>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            공식 사이트에서 실제 서비스를
            이용할 수 있습니다.
          </p>

          <a
            href={service.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex rounded-xl bg-gray-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2"
          >
            {service.name} 공식 사이트
            <span
              className="ml-2"
              aria-hidden="true"
            >
              →
            </span>
          </a>
        </div>
      </article>
    </main>
  );
}
