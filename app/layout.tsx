import type { Metadata } from "next";

import Footer from "@/components/Footer";
import Header from "@/components/Header";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "EasyLife Practice",
    template: "%s | EasyLife",
  },
  description:
    "생활에 필요한 서비스를 한곳에서 찾아보세요.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="flex min-h-screen flex-col bg-gray-50 text-gray-950 antialiased">
        <Header />

        <div className="flex-1">
          {children}
        </div>

        <Footer />
      </body>
    </html>
  );
}