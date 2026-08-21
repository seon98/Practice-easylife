"use client";

import { FormEvent, useState } from "react";

import { useAuth } from "@/components/AuthProvider";
import { createService, deleteService, updateService } from "@/lib/api/admin";
import type { Service } from "@/types/service";

export default function AdminDashboard({ initialServices }: { initialServices: Service[] }) {
  const { user, loading } = useAuth();
  const [services, setServices] = useState(initialServices);
  const [editing, setEditing] = useState<Service | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const input = { name: String(data.get("name")), description: String(data.get("description")), category: String(data.get("category")), url: String(data.get("url")) };
    try {
      const saved = editing ? await updateService(editing.id, input) : await createService(input);
      if (saved) setServices((items) => editing ? items.map((item) => item.id === saved.id ? saved : item) : [...items, saved]);
      setEditing(null); form.reset(); setError(null);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "저장에 실패했습니다."); }
  }

  async function remove(service: Service) {
    if (!window.confirm(`${service.name} 서비스를 삭제할까요?`)) return;
    try { await deleteService(service.id); setServices((items) => items.filter((item) => item.id !== service.id)); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "삭제에 실패했습니다."); }
  }

  if (loading) return <p>권한 확인 중...</p>;
  if (!user) return <p className="rounded-xl border bg-white p-6">로그인이 필요합니다.</p>;
  if (!user.is_admin) return <p className="rounded-xl border bg-white p-6">관리자 권한이 없습니다.</p>;

  return <div className="grid gap-8 lg:grid-cols-[1fr_2fr]">
    <form key={editing?.id ?? "new"} onSubmit={submit} className="space-y-4 rounded-2xl border bg-white p-6">
      <h2 className="text-xl font-bold">{editing ? "서비스 수정" : "서비스 등록"}</h2>
      {(["name", "category", "url"] as const).map((field) => <input key={field} name={field} required defaultValue={editing?.[field]} placeholder={{name:"이름", category:"카테고리", url:"https://..."}[field]} className="w-full rounded-lg border px-3 py-2" />)}
      <textarea name="description" required maxLength={1000} defaultValue={editing?.description} placeholder="설명" className="min-h-28 w-full rounded-lg border px-3 py-2" />
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      <div className="flex gap-2"><button className="rounded-lg bg-gray-950 px-4 py-2 text-white">저장</button>{editing && <button type="button" onClick={() => setEditing(null)}>취소</button>}</div>
    </form>
    <div className="space-y-3">{services.map((service) => <article key={service.id} className="flex items-center justify-between gap-4 rounded-xl border bg-white p-4"><div><h3 className="font-semibold">{service.name}</h3><p className="text-sm text-gray-500">{service.category}</p></div><div className="flex gap-3"><button onClick={() => setEditing(service)}>수정</button><button className="text-red-700" onClick={() => void remove(service)}>삭제</button></div></article>)}</div>
  </div>;
}
