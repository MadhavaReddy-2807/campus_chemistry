import Link from "next/link";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { AppShell } from "@/app/_components/AppShell";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createCommunity } from "../actions";

export const instant = false;

export default async function CreateCommunityPage() {
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

  const categories = [
    "Tech & Coding",
    "Creative & Arts",
    "Music & Jamming",
    "Sports & Fitness",
    "Literature & Debating",
    "Gaming & Anime",
    "Entrepreneurship",
    "Research & Academia",
  ];

  return (
    <AppShell
      activeTab="communities"
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
        <div style={{ background: "#ffffff", borderRadius: "14px", border: "1px solid var(--border-subtle, #e5e7eb)", padding: "1.75rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.5rem" }}>
            <h1 style={{ margin: 0, fontSize: "1.35rem", fontWeight: 700, color: "#111827" }}>
              Create a Campus Community
            </h1>
            <Link href="/communities" style={{ fontSize: "0.85rem", color: "#64748b", textDecoration: "none" }}>
              Cancel
            </Link>
          </div>
          <p style={{ margin: "0 0 1.5rem 0", fontSize: "0.88rem", color: "#64748b" }}>
            Start a club, interest group, or chapter for students across IITs & NITs.
          </p>

          <form action={createCommunity} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.88rem", fontWeight: 600, marginBottom: "0.4rem", color: "#374151" }}>
                Community Name <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <input
                name="name"
                required
                minLength={3}
                maxLength={100}
                placeholder="e.g. Competitive Programming Guild"
                style={{
                  width: "100%",
                  padding: "0.65rem 0.8rem",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  fontSize: "0.9rem",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.88rem", fontWeight: 600, marginBottom: "0.4rem", color: "#374151" }}>
                Category <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <select
                name="category"
                required
                defaultValue="Tech & Coding"
                style={{
                  width: "100%",
                  padding: "0.65rem 0.8rem",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  fontSize: "0.9rem",
                  background: "#ffffff",
                }}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.88rem", fontWeight: 600, marginBottom: "0.4rem", color: "#374151" }}>
                Description <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <textarea
                name="description"
                required
                minLength={10}
                maxLength={1000}
                rows={4}
                placeholder="What is this community about? Who is it for, and what can members expect?"
                style={{
                  width: "100%",
                  padding: "0.65rem 0.8rem",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  fontSize: "0.9rem",
                  resize: "vertical",
                }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid #e5e7eb" }}>
              <Link
                href="/communities"
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
                Create Community
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppShell>
  );
}
