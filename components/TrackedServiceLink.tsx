"use client";
import { trackEvent } from "@/lib/analytics";
export default function TrackedServiceLink({ id, href, children, className }: { id: number; href: string; children: React.ReactNode; className?: string }) {
  return <a href={href} target="_blank" rel="noopener noreferrer" onClick={() => trackEvent("service_click", { service_id: id })} className={className}>{children}</a>;
}
