"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { startLifePlan, updateLifeTask } from "@/lib/api/life-events";
import type { LifeEventDetail, LifePlan } from "@/types/life-event";

export default function LifeChecklist({event}:{event:LifeEventDetail}){
  const {user}=useAuth(); const storageKey=`easylife:life-event:${event.id}`; const [done,setDone]=useState<number[]>([]); const [plan,setPlan]=useState<LifePlan|null>(null); const [message,setMessage]=useState("");
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        setDone(JSON.parse(localStorage.getItem(storageKey) ?? "[]") as number[]);
      } catch {
        setDone([]);
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [storageKey]);
  const percent=useMemo(()=>event.tasks.length?Math.round(done.length*100/event.tasks.length):0,[done,event.tasks.length]);
  async function begin(){try{const result=await startLifePlan(event.id);setPlan(result);setMessage("계정에 실행 플랜을 저장했습니다.")}catch(e){setMessage(e instanceof Error?e.message:"저장하지 못했습니다.")}}
  async function toggle(taskId:number){const completed=!done.includes(taskId);const next=completed?[...done,taskId]:done.filter(id=>id!==taskId);setDone(next);localStorage.setItem(storageKey,JSON.stringify(next));if(plan)try{setPlan(await updateLifeTask(plan.plan_id,taskId,completed))}catch(e){setMessage(e instanceof Error?e.message:"저장하지 못했습니다.")}}
  return <section><div className="rounded-2xl bg-gray-950 p-6 text-white"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-300">나의 진행률</p><p className="mt-1 text-3xl font-bold">{plan?.progress_percent??percent}%</p></div>{user?<button onClick={()=>void begin()} className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-gray-950">{plan?"플랜 저장됨":"내 플랜으로 시작"}</button>:<Link href="/login" className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-gray-950">로그인하고 저장</Link>}</div><div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-700"><div className="h-full bg-blue-400 transition-all" style={{width:`${plan?.progress_percent??percent}%`}}/></div>{message&&<p className="mt-3 text-sm text-gray-200">{message}</p>}</div><ol className="mt-8 space-y-5">{event.tasks.map((task,index)=>{const completed=done.includes(task.id);return <li key={task.id} className={`rounded-2xl border bg-white p-6 ${completed?"border-green-300 bg-green-50/50":""}`}><div className="flex gap-4"><button type="button" onClick={()=>void toggle(task.id)} aria-label={`${task.title} ${completed?"미완료로 변경":"완료로 표시"}`} className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 font-bold ${completed?"border-green-600 bg-green-600 text-white":"border-gray-300"}`}>{completed?"✓":index+1}</button><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold">{task.timing_label}</span><span className="text-xs text-gray-500">{task.task_type==="required"?"필수 확인":task.task_type==="conditional"?"조건부":"권장"}{task.estimated_minutes?` · 약 ${task.estimated_minutes}분`:""}</span></div><h2 className={`mt-3 text-xl font-bold ${completed?"line-through text-gray-500":""}`}>{task.title}</h2><p className="mt-3 leading-7 text-gray-600">{task.description}</p><p className="mt-3 rounded-lg bg-blue-50 p-3 text-sm text-blue-900"><strong>왜 필요한가요?</strong> {task.why_it_matters}</p>{task.required_documents.length>0&&<div className="mt-4"><p className="text-sm font-semibold">준비 자료</p><ul className="mt-2 flex flex-wrap gap-2">{task.required_documents.map(doc=><li key={doc} className="rounded bg-gray-100 px-2 py-1 text-xs">{doc}</li>)}</ul></div>}<div className="mt-5 flex flex-wrap gap-3">{task.official_url&&<a href={task.official_url} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-gray-950 px-4 py-2 text-sm font-semibold text-white">{task.official_source??"공식 사이트"}에서 확인 ↗</a>}{task.services.map(service=><Link key={service.id} href={`/services/${service.id}`} className="rounded-lg border px-4 py-2 text-sm font-semibold">{service.name} 안내</Link>)}</div>{task.caution&&<p className="mt-4 text-xs leading-5 text-gray-500">※ {task.caution}</p>}</div></div></li>})}</ol></section>
}
