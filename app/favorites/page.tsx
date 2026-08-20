import FavoriteServices from "@/components/FavoriteServices";
import { services } from "@/data/services";

export default function FavoritesPage() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-6 py-12 lg:px-8">
      <div className="mb-10">
        <p className="text-sm font-semibold text-gray-500">
          EasyLife
        </p>

        <h1 className="mt-2 text-3xl font-bold">
          즐겨찾기
        </h1>

        <p className="mt-3 text-gray-600">
          저장한 서비스를 한곳에서 확인할 수 있습니다.
        </p>
      </div>

      <FavoriteServices services={services} />
    </main>
  );
}