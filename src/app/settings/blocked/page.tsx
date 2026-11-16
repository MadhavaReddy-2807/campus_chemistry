import Link from "next/link";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { AppShell } from "@/app/_components/AppShell";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { unblockUser } from "./actions";

export const instant = false;

export default async function BlockedAccountsPage() {
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

  const { data: blocks } = await supabase
    .from("blocks")
    .select(`
      blocked_id,
      created_at,
      profiles!blocks_blocked_id_fkey (
        id,
        display_name,
        username,
        avatar_url,
        institutes (
          short_name
        )
      )
    `)
    .eq("blocker_id", user.id);

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

        <div style={{ background: "#ffffff", borderRadius: "14px", border: "1px solid var(--border-subtle, #e5e7eb)", padding: "1.5rem" }}>
          <h1 style={{ margin: "0 0 0.3rem 0", fontSize: "1.35rem", fontWeight: 700, color: "#111827" }}>
            Blocked Accounts
          </h1>
          <p style={{ margin: "0 0 1.25rem 0", fontSize: "0.88rem", color: "#64748b" }}>
            Blocked students cannot message you, see your posts, or view your profile.
          </p>

          {!blocks || blocks.length === 0 ? (
            <div style={{ textAlign: "center", padding: "2.5rem 1rem", color: "#6b7280", fontSize: "0.9rem" }}>
              You haven&apos;t blocked any accounts.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {blocks.map((b) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const profile = b.profiles as any;
                return (
                  <div
                    key={b.blocked_id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "0.75rem 0.5rem",
                      borderBottom: "1px solid #f3f4f6",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "#111827" }}>
                        {profile?.display_name || "Student"}
                      </div>
                      <div style={{ fontSize: "0.78rem", color: "#64748b" }}>
                        @{profile?.username} {profile?.institutes?.short_name ? `• ${profile.institutes.short_name}` : ""}
                      </div>
                    </div>

                    <form action={unblockUser}>
                      <input type="hidden" name="targetId" value={b.blocked_id} />
                      <button
                        type="submit"
                        className="secondary-button"
                        style={{ padding: "0.35rem 0.85rem", fontSize: "0.8rem" }}
                      >
                        Unblock
                      </button>
                    </form>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
