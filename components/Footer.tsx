import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <Link
              href="/"
              className="text-lg font-bold text-gray-950"
            >
              EasyLife
            </Link>

            <p className="mt-2 text-sm text-gray-500">
              생활에 필요한 서비스를
              쉽고 빠르게 찾아보세요.
            </p>
          </div>

          <nav
            className="flex gap-5 text-sm text-gray-500"
            aria-label="하단 메뉴"
          >
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
            <Link href="/guides" className="hover:text-gray-950">가이드</Link>
            <Link href="/legal/privacy" className="hover:text-gray-950">개인정보</Link>
            <Link href="/legal/disclosure" className="hover:text-gray-950">광고·제휴</Link>
          </nav>
        </div>

        <div className="mt-8 border-t border-gray-100 pt-6">
          <p className="text-xs text-gray-400">
            © 2026 EasyLife Practice.
            Learning Project.
          </p>
        </div>
      </div>
    </footer>
  );
}
