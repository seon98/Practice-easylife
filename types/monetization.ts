export interface Guide {
  id: number;
  slug: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  status: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  service_ids: number[];
}

export type AnalyticsEventName =
  | "page_view" | "guide_view" | "service_view" | "service_click"
  | "affiliate_click" | "favorite_add" | "signup" | "login"
  | "subscription_view" | "subscription_started";
