"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";

const navigation = [
  {
    name: "홈",
    href: "/",
  },
  {
    name: "서비스",
    href: "/services",
  },
  {
    name: "즐겨찾기",
    href: "/favorites",
  },
  { name: "가이드", href: "/guides" },
  { name: "Plus", href: "/plus" },
];

export default function Header() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const [isMenuOpen, setIsMenuOpen] =
    useState(false);

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="text-xl font-bold tracking-tight text-gray-950"
          onClick={() => setIsMenuOpen(false)}
        >
          EasyLife
        </Link>

        {/* PC 메뉴 */}
        <nav
          className="hidden items-center gap-2 md:flex"
          aria-label="주요 메뉴"
        >
          {navigation.map((item) => {
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "rounded-lg px-4 py-2 text-sm font-medium transition",
                  active
                    ? "bg-gray-950 text-white"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-950",
                ].join(" ")}
              >
                {item.name}
              </Link>
            );
          })}
          {user?.is_admin && <Link href="/admin" className="rounded-lg px-4 py-2 text-sm font-medium">관리</Link>}
          {user ? (
            <button type="button" onClick={logout} className="rounded-lg px-4 py-2 text-sm font-medium">로그아웃</button>
          ) : (
            <Link href="/login" className="rounded-lg px-4 py-2 text-sm font-medium">로그인</Link>
          )}
        </nav>

        {/* 모바일 메뉴 버튼 */}
        <button
          type="button"
          className="rounded-lg border border-gray-200 p-2 text-gray-700 md:hidden"
          aria-label="메뉴 열기"
          aria-expanded={isMenuOpen}
          onClick={() =>
            setIsMenuOpen(
              (current) => !current,
            )
          }
        >
          {isMenuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* 모바일 메뉴 */}
      {isMenuOpen && (
        <nav
          className="border-t border-gray-200 bg-white px-6 py-4 md:hidden"
          aria-label="모바일 메뉴"
        >
          <div className="mx-auto flex max-w-7xl flex-col gap-2">
            {navigation.map((item) => {
              const active = isActive(
                item.href,
              );

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() =>
                    setIsMenuOpen(false)
                  }
                  className={[
                    "rounded-lg px-4 py-3 text-sm font-medium",
                    active
                      ? "bg-gray-950 text-white"
                      : "text-gray-600 hover:bg-gray-100",
                  ].join(" ")}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
}
