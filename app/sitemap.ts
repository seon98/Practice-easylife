import type { MetadataRoute } from "next";
import { getGuides } from "@/lib/api/guides";
import { getServices } from "@/lib/api/services";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? (process.env.NODE_ENV === "production" ? "https://practice-easylife.vercel.app" : "http://localhost:3000");
  const [guides, services] = await Promise.all([getGuides(), getServices()]);
  return [
    { url: base, changeFrequency: "daily", priority: 1 },
    { url: `${base}/services`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/guides`, changeFrequency: "weekly", priority: 0.8 },
    ...services.map((item) => ({ url: `${base}/services/${item.id}`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.7 })),
    ...guides.map((item) => ({ url: `${base}/guides/${item.slug}`, lastModified: new Date(item.updated_at), changeFrequency: "monthly" as const, priority: 0.7 })),
  ];
}
