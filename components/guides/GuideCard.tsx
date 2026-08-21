import Link from "next/link";
import type { Guide } from "@/types/monetization";

export default function GuideCard({ guide }: { guide: Guide }) {
  return <article className="rounded-2xl border bg-white p-6 shadow-sm">
    <span className="text-xs font-semibold text-blue-700">{guide.category}</span>
    <h2 className="mt-2 text-xl font-bold"><Link href={`/guides/${guide.slug}`}>{guide.title}</Link></h2>
    <p className="mt-3 text-sm leading-6 text-gray-600">{guide.summary}</p>
    <Link href={`/guides/${guide.slug}`} className="mt-5 inline-block font-semibold">가이드 읽기 →</Link>
  </article>;
}
