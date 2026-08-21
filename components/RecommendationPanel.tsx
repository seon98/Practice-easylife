"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getRecommendations } from "@/lib/api/monetization";

type Recommendation = Awaited<ReturnType<typeof getRecommendations>>[number];
export default function RecommendationPanel() {
  const [items, setItems] = useState<Recommendation[]>([]); const [message, setMessage] = useState("추천을 분석하고 있습니다…");
  useEffect(() => { void getRecommendations().then((data) => { setItems(data); setMessage(data.length ? "" : "추천할 서비스가 없습니다."); }).catch((e: Error) => setMessage(e.message)); }, []);
  if (message) return <p className="rounded-xl border bg-white p-6">{message}</p>;
  return <div className="grid gap-4 md:grid-cols-2">{items.map((item) => <article key={item.service.id} className="rounded-xl border bg-white p-5"><p className="text-xs font-semibold text-blue-700">{item.service.category}</p><h2 className="mt-2 text-xl font-bold">{item.service.name}</h2><p className="mt-3 text-sm text-gray-600">{item.reason}</p><p className="mt-3 text-xs font-semibold">광고 아님 · 추천 점수 {item.score}</p><Link href={`/services/${item.service.id}`} className="mt-4 inline-block font-semibold">상세보기 →</Link></article>)}</div>;
}
