"use client";
import { useEffect, useState } from "react";
import { createCheckout, getSubscription } from "@/lib/api/monetization";
import { trackEvent } from "@/lib/analytics";

export default function PlusPanel() {
  const [message, setMessage] = useState("구독 상태 확인 중…");
  useEffect(() => { trackEvent("subscription_view"); void getSubscription().then((s) => setMessage(s.is_plus ? "EasyLife Plus 이용 중" : "현재 무료 플랜을 이용 중입니다.")).catch((e: Error) => setMessage(e.message)); }, []);
  async function checkout() { const result = await createCheckout(); setMessage(result.message); if (result.status !== "unavailable") trackEvent("subscription_started"); }
  return <section className="rounded-2xl border bg-white p-8"><p className="font-semibold">{message}</p><ul className="mt-5 list-disc space-y-2 pl-5 text-gray-600"><li>맞춤 서비스 추천과 추천 이유</li><li>광고 없는 탐색 환경</li><li>관심 서비스 알림</li><li>고급 즐겨찾기와 체크리스트 기반</li></ul><button onClick={() => void checkout()} className="mt-7 rounded-lg bg-gray-950 px-5 py-3 font-semibold text-white">Plus 결제 준비 확인</button><p className="mt-3 text-xs text-gray-500">실제 결제는 결제 사업자와 운영 자격 증명이 설정된 뒤 활성화됩니다.</p></section>;
}
