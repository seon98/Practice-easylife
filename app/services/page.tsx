import ServiceExplorer from "@/components/ServiceExplorer";
import { getServices } from "@/lib/api/services";

export default async function ServicesPage() {
  const services = await getServices();

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-6 py-12 lg:px-8">
      <div className="mb-10">
        <p className="text-sm font-semibold text-gray-500">
          EasyLife
        </p>

        <h1 className="mt-2 text-3xl font-bold text-gray-950">
          전체 서비스
        </h1>

        <p className="mt-3 text-gray-600">
          원하는 서비스를 검색하거나 카테고리별로 찾아보세요.
        </p>
      </div>

      <ServiceExplorer services={services} />
    </main>
  );
}
