import type { Metadata } from "next";
import RecommendationPanel from "@/components/RecommendationPanel";
export const metadata: Metadata = { title: "맞춤 추천", robots: { index: false, follow: false } };
export default function RecommendationsPage() { return <main className="mx-auto min-h-screen max-w-5xl px-6 py-12"><h1 className="text-4xl font-bold">나를 위한 서비스</h1><p className="mt-3 text-gray-600">관심 분야를 기반으로 한 규칙 기반 추천이며 Sponsored 캠페인은 섞이지 않습니다.</p><div className="mt-10"><RecommendationPanel /></div></main>; }
