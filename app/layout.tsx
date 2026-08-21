import type { Metadata } from "next";
import Script from "next/script";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { AuthProvider } from "@/components/AuthProvider";
import AnalyticsTracker from "@/components/analytics/AnalyticsTracker";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ??
      (process.env.NODE_ENV === "production"
        ? "https://practice-easylife.vercel.app"
        : "http://localhost:3000"),
  ),
  title: {
    default: "EasyLife Practice",
    template: "%s | EasyLife",
  },
  description:
    "생활에 필요한 서비스를 한곳에서 찾아보세요.",
  alternates: { canonical: "/" },
  openGraph: { type: "website", locale: "ko_KR", siteName: "EasyLife", title: "EasyLife", description: "생활에 필요한 서비스를 한곳에서 찾아보세요." },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="flex min-h-screen flex-col bg-gray-50 text-gray-950 antialiased">
        {process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_ADS_ENABLED === "true" && process.env.NEXT_PUBLIC_AD_CLIENT_ID && <Script async strategy="afterInteractive" src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(process.env.NEXT_PUBLIC_AD_CLIENT_ID)}`} crossOrigin="anonymous" />}
        <AuthProvider>
        <AnalyticsTracker />
        <Header />

        <div className="flex-1">
          {children}
        </div>

        <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
