import ServiceExplorer from "@/components/ServiceExplorer";
import { getServices } from "@/lib/api/services";
import { getLifeEvents } from "@/lib/api/life-events";
import LifeEventCard from "@/components/life-events/LifeEventCard";
import Link from "next/link";

export default async function Home() {
  const [services, lifeEvents] = await Promise.all([getServices(), getLifeEvents()]);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <p className="text-sm font-semibold text-gray-500">
            EasyLife Practice
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight text-gray-950 sm:text-5xl">
            지금 무엇부터 해야 할지
            <br />
            순서대로 알려드려요.
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-7 text-gray-600">
            이사, 퇴사, 첫 취업, 창업, 출산처럼 삶에 변화가 생기면
            필요한 절차와 공식 서비스를 하나의 체크리스트로 연결합니다.
          </p>
          <Link href="/life-events" className="mt-8 inline-flex rounded-xl bg-gray-950 px-5 py-3 font-semibold text-white">내 상황으로 시작하기 →</Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12 lg:px-8"><div className="flex items-end justify-between gap-4"><div><p className="text-sm font-semibold text-blue-700">생활 내비게이션</p><h2 className="mt-2 text-2xl font-bold">무슨 일이 생겼나요?</h2><p className="mt-2 text-sm text-gray-500">상황을 고르면 해야 할 일을 실행 순서로 안내합니다.</p></div><Link href="/life-events" className="text-sm font-semibold">전체 보기 →</Link></div><div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{lifeEvents.slice(0,5).map(event=><LifeEventCard key={event.id} event={event}/>)}</div></section>

      {/* 서비스 탐색 */}
      <section className="border-t bg-white"><div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-950">
            전체 서비스
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            원하는 서비스를 검색하거나 카테고리별로 찾아보세요.
          </p>
        </div>

        <ServiceExplorer services={services} />
      </div></section>
    </main>
  );
}
