import { connection } from "next/server";
import { redirect } from "next/navigation";
import { AppShell } from "@/app/_components/AppShell";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { EditProfileForm } from "./EditProfileForm";

export const instant = false;

export default async function EditProfilePage() {
  await connection();
  if (!hasSupabaseEnv()) {
    redirect("/login");
  }

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, username, bio, study_year, avatar_url, institute_id, institutes(short_name)")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    redirect("/onboarding");
  }

  // Fetch all interests
  const { data: interests } = await supabase
    .from("interests")
    .select("id, name")
    .eq("is_active", true)
    .order("name");

  // Fetch all institutes for campus dropdown
  const { data: institutes } = await supabase
    .from("institutes")
    .select("id, name, short_name, city")
    .order("name");

  // Fetch user's current interests
  const { data: userInterests } = await supabase
    .from("user_interests")
    .select("interest_id")
    .eq("user_id", user.id);

  const selectedInterestIds = (userInterests || []).map((ui) => ui.interest_id);

  return (
    <AppShell
      activeTab="profile"
      user={{
        name: profile.display_name,
        username: profile.username,
        avatar_url: profile.avatar_url,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        campus: (profile.institutes as any)?.short_name,
      }}
    >
      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "1.5rem 1rem" }}>
        <div style={{ background: "#ffffff", borderRadius: "14px", border: "1px solid var(--border-subtle, #e5e7eb)", padding: "1.75rem" }}>
          <h1 style={{ margin: "0 0 0.4rem 0", fontSize: "1.35rem", fontWeight: 700, color: "#111827" }}>
            Edit Profile
          </h1>
          <p style={{ margin: "0 0 1.5rem 0", fontSize: "0.88rem", color: "#64748b" }}>
            Update your student profile details. These are visible across campus feeds and directory.
          </p>

          <EditProfileForm
            initialName={profile.display_name}
            initialBio={profile.bio || ""}
            initialYear={profile.study_year || 1}
            initialAvatarUrl={profile.avatar_url || ""}
            initialInstituteId={profile.institute_id || ""}
            allInstitutes={institutes || []}
            allInterests={interests || []}
            selectedInterestIds={selectedInterestIds}
          />
        </div>
      </div>
    </AppShell>
  );
}
