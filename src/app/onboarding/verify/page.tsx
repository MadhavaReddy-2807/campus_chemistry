import Link from "next/link";
import { connection } from "next/server";
import { DataState } from "@/app/_components/DataState";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { VerificationForm } from "../VerificationForm";

export const instant = false;

export default async function VerifyInstitutePage() {
  await connection();
  if (!hasSupabaseEnv()) return <main className="onboarding-page"><DataState title="Verification is waiting for Supabase." body="The directory and domain checks run on the server after the backend is configured." action={{ label: "Back to onboarding", href: "/onboarding" }} /></main>;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <main className="onboarding-page"><DataState title="Sign in to verify your institute." body="Verification requests are private and tied to your account." action={{ label: "Sign in", href: "/login" }} /></main>;
  const { data: draft } = await supabase.from("onboarding_drafts").select("institute_id").eq("user_id", user.id).maybeSingle();
  if (!draft?.institute_id) return <main className="onboarding-page"><DataState title="Choose your institute first." body="We need the selected institute before we can validate an email domain." action={{ label: "Choose institute", href: "/onboarding" }} /></main>;
  const { data: institute } = await supabase.from("institutes").select("official_name, short_name").eq("id", draft.institute_id).maybeSingle();
  return <main className="onboarding-page"><div className="onboarding-shell"><div className="onboarding-top"><Link href="/" className="auth-brand"><span className="brand-mark">cc</span><span>campus chemistry</span></Link><span className="step-count">STEP 2 OF 7</span></div><div className="progress-track"><span style={{ width: "28%" }} /></div><section className="onboarding-copy"><span className="eyebrow">VERIFY YOUR CAMPUS</span><h1>Prove your connection to {institute?.short_name ?? "your institute"}.</h1><p>Use an approved institute email. We store the domain and verification status, never the raw email address or private documents.</p><VerificationForm instituteId={draft.institute_id} /><p className="onboarding-note">Your request remains pending until a time-limited email link or an approved manual review completes. Institute selection alone never grants access to dating discovery.</p></section></div></main>;
}
