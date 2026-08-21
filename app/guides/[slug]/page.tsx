import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import AdSlot from "@/components/ads/AdSlot";
import { getGuide } from "@/lib/api/guides";
import { getServices } from "@/lib/api/services";
import GuideViewTracker from "@/components/guides/GuideViewTracker";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? (process.env.NODE_ENV === "production" ? "https://practice-easylife.vercel.app" : "http://localhost:3000");
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params; const guide = await getGuide(slug);
  if (!guide) return { title: "가이드를 찾을 수 없습니다" };
  return { title: guide.title, description: guide.summary, alternates: { canonical: `/guides/${guide.slug}` }, openGraph: { title: guide.title, description: guide.summary, type: "article", url: `${siteUrl}/guides/${guide.slug}`, publishedTime: guide.published_at ?? undefined } };
}

export default async function GuidePage({ params }: Props) {
  const { slug } = await params; const [guide, services] = await Promise.all([getGuide(slug), getServices()]); if (!guide) notFound();
  const related = services.filter((service) => guide.service_ids.includes(service.id));
  const structured = { "@context": "https://schema.org", "@type": "Article", headline: guide.title, description: guide.summary, datePublished: guide.published_at, dateModified: guide.updated_at, mainEntityOfPage: `${siteUrl}/guides/${guide.slug}`, publisher: { "@type": "Organization", name: "EasyLife" } };
  return <main className="mx-auto min-h-screen max-w-3xl px-6 py-12">
    <GuideViewTracker guideId={guide.id} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structured).replace(/</g, "\\u003c") }} />
    <nav aria-label="breadcrumb" className="text-sm text-gray-500"><Link href="/">홈</Link> / <Link href="/guides">가이드</Link> / {guide.title}</nav>
    <article className="mt-8"><span className="text-sm font-semibold text-blue-700">{guide.category}</span><h1 className="mt-3 text-4xl font-bold leading-tight">{guide.title}</h1><p className="mt-5 text-lg text-gray-600">{guide.summary}</p><div className="prose mt-10 max-w-none whitespace-pre-wrap leading-8">{guide.content}</div></article>
    <AdSlot slot={process.env.NEXT_PUBLIC_AD_GUIDE_SLOT} className="mt-10" />
    {related.length > 0 && <section className="mt-12 border-t pt-8"><h2 className="text-2xl font-bold">관련 서비스</h2><div className="mt-4 grid gap-3">{related.map((service) => <Link key={service.id} href={`/services/${service.id}`} className="rounded-xl border bg-white p-4 font-semibold">{service.name} <span aria-hidden>→</span></Link>)}</div></section>}
  </main>;
}
