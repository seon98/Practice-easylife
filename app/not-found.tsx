import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-6 text-center">
      <p className="text-sm font-bold text-gray-400">
        404
      </p>

      <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-950">
        페이지를 찾을 수 없습니다.
      </h1>

      <p className="mt-5 max-w-md text-sm leading-6 text-gray-500">
        요청하신 페이지가 존재하지 않거나
        주소가 변경되었을 수 있습니다.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="rounded-xl bg-gray-950 px-5 py-3 text-sm font-semibold text-white"
        >
          홈으로 이동
        </Link>

        <Link
          href="/services"
          className="rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-700"
        >
          서비스 보기
        </Link>
      </div>
    </main>
  );
}