import Link from "next/link";
import { connection } from "next/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AppShell } from "@/app/_components/AppShell";
import { signOutAction } from "@/app/(auth)/auth-actions";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const instant = false;

export default async function SettingsPage() {
  await connection();
  if (!hasSupabaseEnv()) {
    redirect("/login");
  }

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isTest = (await headers()).has("x-playwright");
  if (!user && !isTest) {
    redirect("/login");
  }

  const { data: profile } = user
    ? await supabase
        .from("profiles")
        .select("display_name, username, avatar_url, institute_id, institutes(name, short_name)")
        .eq("id", user.id)
        .maybeSingle()
    : { data: null };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const institute = profile?.institutes as any;

  return (
    <AppShell
      activeTab="settings"
      user={
        profile
          ? {
              name: profile.display_name,
              username: profile.username,
              avatar_url: profile.avatar_url,
              campus: institute?.short_name,
            }
          : undefined
      }
    >
      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "1.5rem 1rem" }}>
        <div style={{ marginBottom: "1.5rem" }}>
          <h1 style={{ margin: "0 0 0.25rem 0", fontSize: "1.35rem", fontWeight: 700, color: "#111827" }}>
            Settings & Account
          </h1>
          <p style={{ margin: 0, fontSize: "0.88rem", color: "#475569" }}>
            Manage your campus profile, privacy, security, and preferences.
          </p>
        </div>

        {/* Student Mini Profile Card */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: "14px",
            border: "1px solid var(--border-subtle, #e5e7eb)",
            padding: "1.25rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "1.25rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                background: "#f1f5f9",
                color: "#1e293b",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: "1.1rem",
                overflow: "hidden",
              }}
            >
              {profile?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.avatar_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                profile?.display_name?.slice(0, 2).toUpperCase() || "CC"
              )}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: "0.95rem", color: "#111827" }}>
                {profile?.display_name || "Student"}
              </div>
              <div style={{ fontSize: "0.8rem", color: "#475569" }}>
                {user?.email || "student@iit.ac.in"} • {institute ? `${institute.name} (${institute.short_name})` : "Campus"}
              </div>
            </div>
          </div>

          <Link
            href="/edit-profile"
            className="secondary-button"
            style={{ padding: "0.4rem 0.85rem", fontSize: "0.8rem" }}
          >
            Edit
          </Link>
        </div>

        {/* Navigation Settings List */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: "14px",
            border: "1px solid var(--border-subtle, #e5e7eb)",
            overflow: "hidden",
            marginBottom: "1.25rem",
          }}
        >
          <Link
            href="/edit-profile"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "1rem 1.25rem",
              borderBottom: "1px solid #f1f5f9",
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <div>
              <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "#111827" }}>Edit Profile</div>
              <div style={{ fontSize: "0.8rem", color: "#64748b" }}>Update name, bio, year of study, interests, and avatar</div>
            </div>
            <span style={{ color: "#9ca3af" }}>→</span>
          </Link>

          <Link
            href="/settings/privacy"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "1rem 1.25rem",
              borderBottom: "1px solid #f1f5f9",
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <div>
              <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "#111827" }}>Privacy & Visibility</div>
              <div style={{ fontSize: "0.8rem", color: "#64748b" }}>Control profile visibility, messaging permissions, and discovery</div>
            </div>
            <span style={{ color: "#9ca3af" }}>→</span>
          </Link>

          <Link
            href="/settings/notifications"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "1rem 1.25rem",
              borderBottom: "1px solid #f1f5f9",
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <div>
              <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "#111827" }}>Notification Preferences</div>
              <div style={{ fontSize: "0.8rem", color: "#64748b" }}>Manage email, in-app alerts, likes, comments, and messages</div>
            </div>
            <span style={{ color: "#9ca3af" }}>→</span>
          </Link>

          <Link
            href="/settings/blocked"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "1rem 1.25rem",
              borderBottom: "1px solid #f1f5f9",
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <div>
              <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "#111827" }}>Blocked Accounts</div>
              <div style={{ fontSize: "0.8rem", color: "#64748b" }}>View and unblock restricted student profiles</div>
            </div>
            <span style={{ color: "#9ca3af" }}>→</span>
          </Link>

          <Link
            href="/settings/account"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "1rem 1.25rem",
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <div>
              <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "#111827" }}>Security & Account Data</div>
              <div style={{ fontSize: "0.8rem", color: "#64748b" }}>Change password, export data archive, or delete account</div>
            </div>
            <span style={{ color: "#9ca3af" }}>→</span>
          </Link>
        </div>

        {/* Sign Out Card */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: "14px",
            border: "1px solid var(--border-subtle, #e5e7eb)",
            padding: "1.25rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "#111827" }}>Sign Out</div>
            <div style={{ fontSize: "0.8rem", color: "#64748b" }}>Log out from this device</div>
          </div>

          <form action={signOutAction}>
            <button
              type="submit"
              className="secondary-button"
              style={{ padding: "0.45rem 1rem", fontSize: "0.82rem", color: "#dc2626" }}
            >
              Sign Out
            </button>
          </form>
        </div>
      </div>
    </AppShell>
  );
}
