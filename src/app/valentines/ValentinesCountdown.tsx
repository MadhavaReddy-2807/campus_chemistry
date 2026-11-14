"use client";

import { useEffect, useState } from "react";
import { valentinesCampaign } from "@/lib/config/campaign";

function remaining(target: number) {
  const difference = Math.max(0, target - Date.now());
  return { days: Math.floor(difference / 86400000), hours: Math.floor(difference / 3600000) % 24, minutes: Math.floor(difference / 60000) % 60 };
}

export function ValentinesCountdown() {
  const target = new Date(valentinesCampaign.startDate).getTime();
  const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0 });
  useEffect(() => { const initial = window.setTimeout(() => setTime(remaining(target)), 0); const timer = window.setInterval(() => setTime(remaining(target)), 60000); return () => { window.clearTimeout(initial); window.clearInterval(timer); }; }, [target]);
  return <div className="campaign-countdown" aria-live="polite"><span><strong>{time.days}</strong><small>days</small></span><span><strong>{time.hours}</strong><small>hours</small></span><span><strong>{time.minutes}</strong><small>minutes</small></span></div>;
}
