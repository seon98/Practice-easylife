import type { Metadata } from "next";
import PlusPanel from "@/components/PlusPanel";
export const metadata: Metadata = { title: "EasyLife Plus", description: "맞춤 추천과 알림을 제공하는 EasyLife Plus", alternates: { canonical: "/plus" } };
export default function PlusPage() { return <main className="mx-auto min-h-screen max-w-3xl px-6 py-12"><h1 className="text-4xl font-bold">EasyLife Plus</h1><p className="mt-3 text-gray-600">나에게 필요한 서비스를 더 빠르게 찾고 놓치지 않도록 돕습니다.</p><div className="mt-10"><PlusPanel /></div></main>; }
