import Link from "next/link";
import { connection } from "next/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { OFFICIAL_INSTITUTES } from "@/lib/data/institutes";
import { OnboardingForm } from "./OnboardingForm";

export const instant = false;

type Institute = {
  id: string;
  official_name: string;
  short_name: string;
  city: string;
  state: string;
  institute_type: "IIT" | "NIT";
};

async function getInstitutes(): Promise<Institute[]> {
  if (hasSupabaseEnv()) {
    try {
      const supabase = await createSupabaseServerClient();
      const { data } = await supabase
        .from("institutes")
        .select("id, official_name, short_name, city, state, institute_type")
        .eq("is_active", true)
        .order("official_name");
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

  return (
    <main className="onboarding-page">
      <div className="onboarding-shell" style={{ maxWidth: 640 }}>
        <div className="onboarding-top">
          <Link href="/" className="auth-brand">
            <span className="brand-mark">cc</span>
            <span>campus chemistry</span>
          </Link>
          <span className="step-count">PROFILE SETUP</span>
        </div>

        <section className="onboarding-copy" style={{ marginTop: 40 }}>
          <span className="eyebrow">WELCOME TO CAMPUS</span>
          <h1>Set up your profile</h1>
          <p>
            Connect with verified students across IITs and NITs. Tell us a little about your campus and year of study.
          </p>

          <OnboardingForm institutes={institutes} />

          <p className="onboarding-note" style={{ marginTop: 24, fontSize: 11, color: "var(--soft)" }}>
            Campus selection sets your initial network. You can verify your institute email domain anytime from Settings.
          </p>
        </section>
      </div>
    </main>
  );
}
