"use client";
import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";
export default function GuideViewTracker({ guideId }: { guideId: number }) { useEffect(() => { trackEvent("guide_view", { guide_id: guideId }); }, [guideId]); return null; }
