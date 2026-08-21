"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { useAuth } from "@/components/AuthProvider";
import { login, signup } from "@/lib/api/auth";
import { CLIENT_ID_KEY } from "@/lib/api/favorites";

export default function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const { acceptAuth } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email"));
    const password = String(data.get("password"));
    try {
      const result = mode === "login"
        ? await login(email, password, localStorage.getItem(CLIENT_ID_KEY))
        : await signup(email, password);
      acceptAuth(result);
      router.push("/services");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "요청을 처리하지 못했습니다.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-md space-y-5 rounded-2xl border bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-bold">{mode === "login" ? "로그인" : "회원가입"}</h1>
      <label className="block text-sm font-medium">이메일
        <input name="email" type="email" required autoComplete="email" maxLength={320} className="mt-2 w-full rounded-lg border px-3 py-2" />
      </label>
      <label className="block text-sm font-medium">비밀번호
        <input name="password" type="password" required minLength={mode === "signup" ? 10 : 1} maxLength={128} autoComplete={mode === "login" ? "current-password" : "new-password"} className="mt-2 w-full rounded-lg border px-3 py-2" />
      </label>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      <button disabled={pending} className="w-full rounded-lg bg-gray-950 px-4 py-3 font-semibold text-white disabled:opacity-50">
        {pending ? "처리 중..." : mode === "login" ? "로그인" : "계정 만들기"}
      </button>
      <p className="text-sm text-gray-600">
        {mode === "login" ? "계정이 없나요? " : "이미 계정이 있나요? "}
        <Link className="font-semibold underline" href={mode === "login" ? "/signup" : "/login"}>{mode === "login" ? "회원가입" : "로그인"}</Link>
      </p>
    </form>
  );
}
