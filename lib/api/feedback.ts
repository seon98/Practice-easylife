const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

export interface FeedbackPayload {
  category: "general" | "correction" | "broken_link" | "privacy";
  email?: string;
  page_url?: string;
  message: string;
  privacy_consent: boolean;
}

export async function submitFeedback(payload: FeedbackPayload): Promise<void> {
  const response = await fetch(`${API}/api/v1/feedback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error("요청을 접수하지 못했습니다. 잠시 후 다시 시도해 주세요.");
}
