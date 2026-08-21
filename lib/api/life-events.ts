import { cache } from "react";
import { getAccessToken } from "@/lib/api/auth";
import type { LifeEventDetail, LifeEventSummary, LifePlan } from "@/types/life-event";
const SERVER_API=process.env.API_BASE_URL??"http://127.0.0.1:8000"; const CLIENT_API=process.env.NEXT_PUBLIC_API_BASE_URL??"http://127.0.0.1:8000";
export async function getLifeEvents():Promise<LifeEventSummary[]>{const r=await fetch(`${SERVER_API}/api/v1/life-events`,{next:{revalidate:300}});if(!r.ok)throw new Error("생활상황을 불러오지 못했습니다.");return r.json();}
export const getLifeEvent=cache(async(slug:string):Promise<LifeEventDetail|null>=>{const r=await fetch(`${SERVER_API}/api/v1/life-events/${encodeURIComponent(slug)}`,{next:{revalidate:300}});if(r.status===404)return null;if(!r.ok)throw new Error("생활상황을 불러오지 못했습니다.");return r.json();});
const auth=()=>({"Content-Type":"application/json",Authorization:`Bearer ${getAccessToken()??""}`});
export async function startLifePlan(eventId:number):Promise<LifePlan>{const r=await fetch(`${CLIENT_API}/api/v1/life-events/${eventId}/plans`,{method:"POST",headers:auth()});if(!r.ok)throw new Error(r.status===401?"로그인하면 완료 상태와 알림을 저장할 수 있습니다.":"플랜을 시작하지 못했습니다.");return r.json();}
export async function updateLifeTask(planId:number,taskId:number,isCompleted:boolean):Promise<LifePlan>{const r=await fetch(`${CLIENT_API}/api/v1/life-events/plans/${planId}/tasks/${taskId}`,{method:"PATCH",headers:auth(),body:JSON.stringify({is_completed:isCompleted})});if(!r.ok)throw new Error("완료 상태를 저장하지 못했습니다.");return r.json();}
