"use client";

import { useEffect } from "react";

declare global { interface Window { adsbygoogle?: unknown[] } }

export default function AdSlot({ slot, className = "" }: { slot?: string; className?: string }) {
  const enabled = process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_ADS_ENABLED === "true";
  const client = process.env.NEXT_PUBLIC_AD_CLIENT_ID;
  useEffect(() => {
    if (enabled && client && slot) try { (window.adsbygoogle = window.adsbygoogle ?? []).push({}); } catch { /* provider script may still be loading */ }
  }, [client, enabled, slot]);
  if (!enabled || !client || !slot) return null;
  return <aside aria-label="광고" className={`rounded-xl border border-dashed bg-gray-50 p-3 ${className}`}>
    <p className="mb-2 text-center text-[10px] font-semibold uppercase tracking-widest text-gray-500">광고</p>
    <ins className="adsbygoogle block min-h-24" data-ad-client={client} data-ad-slot={slot} data-ad-format="auto" data-full-width-responsive="true" />
  </aside>;
}
