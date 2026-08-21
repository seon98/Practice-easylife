"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

export default function AnalyticsTracker() {
  const pathname = usePathname();
  useEffect(() => { trackEvent("page_view", { metadata: { path: pathname } }); }, [pathname]);
  return null;
}
