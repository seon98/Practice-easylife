import type { Metadata } from "next";
import LifeEventExplorer from "@/components/life-events/LifeEventExplorer";
import AdSlot from "@/components/ads/AdSlot";
import { getLifeEvents } from "@/lib/api/life-events";
export const dynamic="force-dynamic";
export const metadata:Metadata={title:"생활상황 실행 플랜",description:"이사·퇴사·취업·창업·출산처럼 삶에 변화가 생겼을 때 해야 할 일을 순서대로 확인하세요.",alternates:{canonical:"/life-events"}};
export default async function LifeEventsPage(){const events=await getLifeEvents();return <main className="mx-auto min-h-screen max-w-7xl px-6 py-12"><p className="text-sm font-semibold text-blue-700">생활 내비게이션</p><h1 className="mt-3 text-4xl font-bold">무슨 일이 생겼나요?</h1><p className="mt-4 max-w-2xl leading-7 text-gray-600">기관 이름을 몰라도 괜찮습니다. 지금 상황을 고르면 해야 할 일, 준비 자료와 공식 신청처를 실행 순서로 안내합니다.</p><AdSlot slot={process.env.NEXT_PUBLIC_AD_LIST_SLOT} className="mt-8"/><div className="mt-10"><LifeEventExplorer events={events}/></div></main>}
