"use client";

import { useEffect } from "react";

interface ErrorPageProps {
  error: Error & {
    digest?: string;
  };
  reset: () => void;
}

export default function ErrorPage({
  error,
  reset,
}: ErrorPageProps) {
  useEffect(() => {
    console.error(
      "페이지 렌더링 오류:",
      error,
    );
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-6 text-center">
      <div
        className="text-5xl"
        aria-hidden="true"
      >
        ⚠
      </div>

      <h1 className="mt-6 text-3xl font-bold text-gray-950">
        문제가 발생했습니다.
      </h1>

      <p className="mt-4 max-w-md text-sm leading-6 text-gray-500">
        페이지를 처리하는 중 예상하지 못한
        오류가 발생했습니다.
      </p>

      <button
        type="button"
        onClick={reset}
        className="mt-8 rounded-xl bg-gray-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-700"
      >
        다시 시도
      </button>
    </main>
  );
}