export default function Loading() {
  return (
    <main className="mx-auto min-h-[70vh] max-w-7xl px-6 py-12 lg:px-8">
      <div
        className="animate-pulse"
        aria-label="페이지를 불러오는 중"
      >
        {/* 제목 Skeleton */}
        <div className="h-4 w-24 rounded bg-gray-200" />

        <div className="mt-4 h-9 w-64 rounded bg-gray-200" />

        <div className="mt-4 h-4 w-96 max-w-full rounded bg-gray-200" />

        {/* 카드 Skeleton */}
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({
            length: 6,
          }).map((_, index) => (
            <div
              key={index}
              className="h-64 rounded-2xl border border-gray-200 bg-white p-6"
            >
              <div className="h-6 w-16 rounded-full bg-gray-200" />

              <div className="mt-5 h-6 w-32 rounded bg-gray-200" />

              <div className="mt-5 space-y-3">
                <div className="h-4 rounded bg-gray-200" />
                <div className="h-4 rounded bg-gray-200" />
                <div className="h-4 w-2/3 rounded bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}