import type { Metadata } from "next";

import Header from "@/components/Header";

import "./globals.css";

export const metadata: Metadata = {
  title: "EasyLife Practice",
  description: "생활에 필요한 서비스를 한곳에서 찾아보세요.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="bg-gray-50 text-gray-950">
        <Header />

        {children}
      </body>
    </html>
  );
}