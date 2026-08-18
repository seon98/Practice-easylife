import type { Metadata } from "next";
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
      <body>{children}</body>
    </html>
  );
}