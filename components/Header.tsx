import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <Link
          href="/"
          className="text-xl font-bold text-gray-950"
        >
          EasyLife
        </Link>

        <nav className="flex items-center gap-6 text-sm font-medium text-gray-600">
          <Link
            href="/"
            className="hover:text-gray-950"
          >
            홈
          </Link>

          <Link
            href="/services"
            className="hover:text-gray-950"
          >
            서비스
          </Link>

          <Link
            href="/favorites"
            className="hover:text-gray-950"
          >
            즐겨찾기
          </Link>
        </nav>
      </div>
    </header>
  );
}