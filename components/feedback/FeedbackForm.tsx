"use client";

import { FormEvent, useState } from "react";
import { submitFeedback } from "@/lib/api/feedback";

export default function FeedbackForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setStatus("sending");
    setError("");
    try {
      await submitFeedback({
        category: data.get("category") as "general" | "correction" | "broken_link" | "privacy",
        email: String(data.get("email") ?? "") || undefined,
        page_url: String(data.get("page_url") ?? "") || undefined,
        message: String(data.get("message") ?? ""),
        privacy_consent: data.get("privacy_consent") === "on",
      });
      form.reset();
      setStatus("sent");
    } catch (cause) {
      setStatus("idle");
      setError(cause instanceof Error ? cause.message : "접수하지 못했습니다.");
    }
  }

  if (status === "sent") return <div role="status" className="rounded-2xl border border-green-200 bg-green-50 p-6"><h2 className="text-xl font-bold text-green-900">접수되었습니다</h2><p className="mt-2 text-sm leading-6 text-green-800">보내주신 내용을 검토해 콘텐츠와 서비스 개선에 반영하겠습니다.</p><button className="mt-4 text-sm font-semibold underline" onClick={() => setStatus("idle")}>다른 내용 보내기</button></div>;

  return <form onSubmit={submit} className="space-y-5 rounded-2xl border bg-white p-6 sm:p-8">
    <label className="block"><span className="text-sm font-semibold">문의 유형</span><select name="category" required className="mt-2 w-full rounded-lg border px-3 py-3"><option value="general">일반 문의</option><option value="correction">콘텐츠 수정 요청</option><option value="broken_link">깨진 링크·오류 신고</option><option value="privacy">개인정보 문의</option></select></label>
    <label className="block"><span className="text-sm font-semibold">확인한 페이지 주소 <span className="font-normal text-gray-500">(선택)</span></span><input name="page_url" type="url" placeholder="https://practice-easylife.vercel.app/..." className="mt-2 w-full rounded-lg border px-3 py-3"/></label>
    <label className="block"><span className="text-sm font-semibold">답변받을 이메일 <span className="font-normal text-gray-500">(선택)</span></span><input name="email" type="email" autoComplete="email" className="mt-2 w-full rounded-lg border px-3 py-3"/></label>
    <label className="block"><span className="text-sm font-semibold">내용</span><textarea name="message" required minLength={10} maxLength={5000} className="mt-2 min-h-40 w-full rounded-lg border px-3 py-3" placeholder="어떤 정보가 잘못되었거나 불편했는지 구체적으로 알려주세요."/></label>
    <label className="flex items-start gap-3 text-sm leading-6 text-gray-600"><input name="privacy_consent" type="checkbox" required className="mt-1"/><span>문의 처리 목적으로 입력한 이메일과 내용을 저장하는 데 동의합니다. 이메일을 입력하지 않아도 신고할 수 있습니다.</span></label>
    {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    <button disabled={status === "sending"} className="rounded-lg bg-gray-950 px-5 py-3 font-semibold text-white disabled:opacity-50">{status === "sending" ? "접수 중…" : "문의 접수"}</button>
  </form>;
}
