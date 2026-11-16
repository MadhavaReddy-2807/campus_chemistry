import Link from "next/link";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { AppShell } from "@/app/_components/AppShell";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requestAccountDeletion, changePassword } from "./actions";

export const instant = false;

export default async function AccountSettingsPage() {
  await connection();
  if (!hasSupabaseEnv()) {
    redirect("/login");
  }

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data: currentUserProfile } = await supabase
    .from("profiles")
    .select("display_name, username, avatar_url, institutes(short_name)")
    .eq("id", user.id)
    .maybeSingle();

  const { data: deletion } = await supabase
    .from("account_deletion_requests")
    .select("status, requested_at")
    .eq("user_id", user.id)
    .eq("status", "pending")
    .maybeSingle();

  return (
    <AppShell
      activeTab="settings"
      user={
        currentUserProfile
          ? {
              name: currentUserProfile.display_name,
              username: currentUserProfile.username,
              avatar_url: currentUserProfile.avatar_url,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              campus: (currentUserProfile.institutes as any)?.short_name,
            }
          : undefined
      }
    >
      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "1.5rem 1rem" }}>
        <div style={{ marginBottom: "1rem" }}>
          <Link href="/settings" style={{ fontSize: "0.85rem", color: "#64748b", textDecoration: "none" }}>
            ← Back to Settings
          </Link>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {/* Change Password Card */}
          <section style={{ background: "#ffffff", borderRadius: "14px", border: "1px solid var(--border-subtle, #e5e7eb)", padding: "1.5rem" }}>
            <h2 style={{ margin: "0 0 0.3rem 0", fontSize: "1.15rem", fontWeight: 700, color: "#111827" }}>
              Change Password
            </h2>
            <p style={{ margin: "0 0 1.25rem 0", fontSize: "0.85rem", color: "#64748b" }}>
              Update your account password. Must be at least 8 characters.
            </p>

            <form action={changePassword} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.35rem", color: "#374151" }}>
                  New Password
                </label>
                <input
                  name="newPassword"
                  type="password"
                  required
                  minLength={8}
                  style={{
                    width: "100%",
                    padding: "0.6rem 0.8rem",
                    borderRadius: "8px",
                    border: "1px solid #d1d5db",
                    fontSize: "0.9rem",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.35rem", color: "#374151" }}>
                  Confirm New Password
                </label>
                <input
                  name="confirmPassword"
                  type="password"
                  required
                  minLength={8}
                  style={{
                    width: "100%",
                    padding: "0.6rem 0.8rem",
                    borderRadius: "8px",
                    border: "1px solid #d1d5db",
                    fontSize: "0.9rem",
                  }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "0.5rem" }}>
                <button
                  type="submit"
                  className="primary-button"
                  style={{ padding: "0.55rem 1.25rem", fontSize: "0.85rem" }}
                >
                  Update Password
                </button>
              </div>
            </form>
          </section>

          {/* Export Data Card */}
          <section style={{ background: "#ffffff", borderRadius: "14px", border: "1px solid var(--border-subtle, #e5e7eb)", padding: "1.5rem" }}>
            <h2 style={{ margin: "0 0 0.3rem 0", fontSize: "1.15rem", fontWeight: 700, color: "#111827" }}>
              Export Your Data
            </h2>
            <p style={{ margin: "0 0 1.25rem 0", fontSize: "0.85rem", color: "#64748b" }}>
              Download a JSON archive of your student profile, posts, comments, and interactions.
            </p>
            <a
              href="/account/export"
              className="secondary-button"
              style={{ display: "inline-block", padding: "0.55rem 1.25rem", fontSize: "0.85rem" }}
            >
              Download Data Archive ↓
            </a>
          </section>

          {/* Account Deletion Card */}
          <section style={{ background: "#ffffff", borderRadius: "14px", border: "1px solid #fee2e2", padding: "1.5rem" }}>
            <h2 style={{ margin: "0 0 0.3rem 0", fontSize: "1.15rem", fontWeight: 700, color: "#991b1b" }}>
              Delete Account
            </h2>
            <p style={{ margin: "0 0 1.25rem 0", fontSize: "0.85rem", color: "#64748b" }}>
              Submitting an account deletion request will permanently remove your student profile, posts, and messages.
            </p>
            {deletion ? (
              <p style={{ color: "#059669", fontWeight: 600, fontSize: "0.88rem", margin: 0 }}>
                Deletion request submitted on {new Date(deletion.requested_at).toLocaleDateString("en-IN")}. Pending review.
              </p>
            ) : (
              <form action={requestAccountDeletion}>
                <button
                  type="submit"
                  className="secondary-button"
                  style={{ padding: "0.55rem 1.25rem", fontSize: "0.85rem", color: "#dc2626", borderColor: "#fca5a5" }}
                >
                  Request Account Deletion
                </button>
              </form>
            )}
          </section>
        </div>
      </div>
    </AppShell>
  );
}
