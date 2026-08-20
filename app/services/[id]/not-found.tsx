import Link from "next/link";

export default function ServiceNotFound() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-6 text-center">
      <p className="text-sm font-semibold text-gray-500">
        404
      </p>

      <h1 className="mt-3 text-3xl font-bold text-gray-950">
        서비스를 찾을 수 없습니다.
      </h1>

      <p className="mt-4 text-gray-600">
        존재하지 않거나 삭제된 서비스입니다.
      </p>

      <Link
        href="/services"
        className="mt-8 rounded-xl bg-gray-950 px-5 py-3 text-sm font-semibold text-white"
      >
        전체 서비스로 돌아가기
      </Link>
    </main>
  );
}