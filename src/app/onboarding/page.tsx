import Link from "next/link";
import { connection } from "next/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { OFFICIAL_INSTITUTES } from "@/lib/data/institutes";
import { InstitutePicker } from "./InstitutePicker";

export const instant = false;

type Institute = { id: string; official_name: string; short_name: string; city: string; state: string; institute_type: "IIT" | "NIT" };

async function getInstitutes(): Promise<Institute[]> {
  if (hasSupabaseEnv()) {
    try {
      const supabase = await createSupabaseServerClient();
      const { data } = await supabase.from("institutes").select("id, official_name, short_name, city, state, institute_type").eq("is_active", true).order("official_name");
      if (data && data.length > 0) return data;
    } catch {
      // Fallback to official dataset
    }
  }
  return OFFICIAL_INSTITUTES.map(({ id, official_name, short_name, city, state, institute_type }) => ({
    id,
    official_name,
    short_name,
    city,
    state,
    institute_type,
  }));
}

export default async function OnboardingPage() {
  await connection();
  const institutes = await getInstitutes();
  return <main className="onboarding-page"><div className="onboarding-shell"><div className="onboarding-top"><Link href="/" className="auth-brand"><span className="brand-mark">cc</span><span>campus chemistry</span></Link><span className="step-count">STEP 1 OF 7</span></div><div className="progress-track"><span /></div><section className="onboarding-copy"><span className="eyebrow">FIRST, YOUR CAMPUS</span><h1>Where does your story happen?</h1><p>Choose your institute so we can build a space that feels close to home. You&apos;ll verify your membership next.</p><InstitutePicker institutes={institutes} /><p className="onboarding-note">Institute selection alone never grants verified status. We&apos;ll ask for an approved institute email or private manual review.</p></section></div></main>;
}
