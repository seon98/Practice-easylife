import type { Service } from "@/types/service";
export interface LifeTask { id:number; title:string; description:string; why_it_matters:string; task_type:string; timing_label:string; deadline_days:number|null; estimated_minutes:number|null; required_documents:string[]; official_url:string|null; official_source:string|null; caution:string|null; display_order:number; services:Service[]; }
export interface LifeEventSummary { id:number; slug:string; title:string; short_label:string; description:string; icon:string; category:string; audience:string[]; reviewed_at:string|null; task_count:number; }
export interface LifeEventDetail extends LifeEventSummary { tasks:LifeTask[]; }
export interface LifePlan { plan_id:number; life_event_id:number; status:string; completed_tasks:number; total_tasks:number; progress_percent:number; }
