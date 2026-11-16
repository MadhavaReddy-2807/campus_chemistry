import Link from "next/link";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { AppShell } from "@/app/_components/AppShell";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { updatePrivacy } from "./actions";

export const instant = false;

export default async function PrivacyPage() {
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
    .select("display_name, username, avatar_url, social_visibility, dating_visibility, cross_campus_visibility, message_permission, activity_visibility, institutes(short_name)")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    redirect("/onboarding");
  }

  return (
    <AppShell
      activeTab="settings"
      user={{
        name: profile.display_name,
        username: profile.username,
        avatar_url: profile.avatar_url,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        campus: (profile.institutes as any)?.short_name,
      }}
    >
      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "1.5rem 1rem" }}>
        <div style={{ marginBottom: "1rem" }}>
          <Link href="/settings" style={{ fontSize: "0.85rem", color: "#64748b", textDecoration: "none" }}>
            ← Back to Settings
          </Link>
        </div>

        <div style={{ background: "#ffffff", borderRadius: "14px", border: "1px solid var(--border-subtle, #e5e7eb)", padding: "1.75rem" }}>
          <h1 style={{ margin: "0 0 0.3rem 0", fontSize: "1.35rem", fontWeight: 700, color: "#111827" }}>
            Privacy & Visibility
          </h1>
          <p style={{ margin: "0 0 1.5rem 0", fontSize: "0.88rem", color: "#64748b" }}>
            Control who can see your campus profile, message you, and interact with your posts.
          </p>

          <form action={updatePrivacy} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.88rem", fontWeight: 600, marginBottom: "0.4rem", color: "#374151" }}>
                Social Profile Visibility
              </label>
              <select
                name="socialVisibility"
                defaultValue={profile.social_visibility || "public"}
                style={{
                  width: "100%",
                  padding: "0.65rem 0.8rem",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  fontSize: "0.9rem",
                  background: "#ffffff",
                }}
              >
                <option value="public">Public to all verified IIT & NIT students</option>
                <option value="private">Private (Only approved followers)</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.88rem", fontWeight: 600, marginBottom: "0.4rem", color: "#374151" }}>
                Direct Messaging Permissions
              </label>
              <select
                name="messagePermission"
                defaultValue={profile.message_permission || "everyone"}
                style={{
                  width: "100%",
                  padding: "0.65rem 0.8rem",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  fontSize: "0.9rem",
                  background: "#ffffff",
                }}
              >
                <option value="everyone">Any verified student</option>
                <option value="following">Students I follow</option>
                <option value="nobody">Nobody (Disable direct messages)</option>
              </select>
            </div>

            <div style={{ borderTop: "1px solid #f3f4f6", paddingTop: "1rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
              <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "#111827" }}>Cross-Campus Visibility</div>
                  <div style={{ fontSize: "0.8rem", color: "#64748b" }}>Allow students outside your home institute to discover your profile</div>
                </div>
                <input
                  name="crossCampusVisibility"
                  type="checkbox"
                  defaultChecked={profile.cross_campus_visibility ?? true}
                  style={{ width: "18px", height: "18px", accentColor: "var(--primary-color, #9f4b59)" }}
                />
              </label>

              <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "#111827" }}>Active Status</div>
                  <div style={{ fontSize: "0.8rem", color: "#64748b" }}>Show when you were recently active on campus feeds</div>
                </div>
                <input
                  name="activityVisibility"
                  type="checkbox"
                  defaultChecked={profile.activity_visibility ?? true}
                  style={{ width: "18px", height: "18px", accentColor: "var(--primary-color, #9f4b59)" }}
                />
              </label>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid #e5e7eb" }}>
              <Link
                href="/settings"
                className="secondary-button"
                style={{ padding: "0.6rem 1.25rem", fontSize: "0.88rem" }}
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="primary-button"
                style={{ padding: "0.6rem 1.5rem", fontSize: "0.88rem" }}
              >
                Save Privacy Choices
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppShell>
  );
}
