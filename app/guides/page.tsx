import type { Metadata } from "next";
import Link from "next/link";
import GuideCard from "@/components/guides/GuideCard";
import AdSlot from "@/components/ads/AdSlot";
import { getGuides } from "@/lib/api/guides";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "생활 가이드", description: "생활·취업·복지·창업에 필요한 절차와 공공서비스를 한눈에 확인하세요.", alternates: { canonical: "/guides" }, openGraph: { title: "EasyLife 생활 가이드", description: "내 상황에 필요한 생활 서비스를 찾는 실용 가이드", type: "website" } };

export default async function GuidesPage() {
  const guides = await getGuides();
  return <main className="mx-auto min-h-screen max-w-6xl px-6 py-12">
    <p className="text-sm text-gray-500"><Link href="/">홈</Link> / 가이드</p>
    <h1 className="mt-5 text-4xl font-bold">생활 가이드</h1>
    <p className="mt-3 text-gray-600">복잡한 생활 행정과 지원 서비스를 단계별로 알아보세요.</p>
    <AdSlot slot={process.env.NEXT_PUBLIC_AD_LIST_SLOT} className="mt-8" />
    {guides.length ? <div className="mt-10 grid gap-6 md:grid-cols-2">{guides.map((guide) => <GuideCard key={guide.id} guide={guide} />)}</div> : <p className="mt-10 rounded-xl border bg-white p-8">게시된 가이드를 준비하고 있습니다.</p>}
  </main>;
}
