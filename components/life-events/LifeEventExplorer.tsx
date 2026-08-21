"use client";
import { useMemo, useState } from "react";
import LifeEventCard from "@/components/life-events/LifeEventCard";
import type { LifeEventSummary } from "@/types/life-event";
export default function LifeEventExplorer({events}:{events:LifeEventSummary[]}){const [query,setQuery]=useState("");const filtered=useMemo(()=>events.filter(e=>`${e.title} ${e.description} ${e.audience.join(" ")}`.toLowerCase().includes(query.trim().toLowerCase())),[events,query]);return <><label className="block"><span className="sr-only">생활상황 검색</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="예: 이사, 퇴사, 출산" className="w-full rounded-xl border bg-white px-5 py-4 shadow-sm"/></label><div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{filtered.map(event=><LifeEventCard key={event.id} event={event}/>)}</div>{!filtered.length&&<p className="mt-8 rounded-xl border bg-white p-6">해당 상황은 아직 준비 중입니다. 원하는 상황을 제안해 주세요.</p>}</>}
