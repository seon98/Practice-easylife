import ServiceCard from "@/components/ServiceCard";
import { services } from "@/data/services";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero 영역 */}
      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <p className="text-sm font-semibold text-gray-500">
            EasyLife Practice
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight text-gray-950 sm:text-5xl">
            생활에 필요한 서비스를
            <br />
            한곳에서 찾아보세요.
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-7 text-gray-600">
            공공서비스, 세금, 복지, 취업, 창업 등 일상생활에 필요한
            서비스를 쉽고 빠르게 확인할 수 있습니다.
          </p>
        </div>
      </section>

      {/* 서비스 목록 */}
      <section className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-950">
            전체 서비스
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            현재 {services.length}개의 서비스를 제공하고 있습니다.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
            />
          ))}
        </div>
      </section>
    </main>
  );
}