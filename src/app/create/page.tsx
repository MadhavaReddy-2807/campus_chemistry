import { connection } from "next/server";
import { AppShell } from "@/app/_components/AppShell";
import { type UserSummary } from "@/app/_components/AppSidebar";
import { CreatePostForm } from "./CreatePostForm";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const instant = false;

export default async function CreatePage() {
  await connection();

  let userProfile: UserSummary | null = null;

  if (hasSupabaseEnv()) {
    try {
      const supabase = await createSupabaseServerClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("id, display_name, username, institutes(short_name)")
          .eq("id", user.id)
          .maybeSingle();

        if (profile) {
          const inst = profile.institutes as { short_name?: string } | null;
          userProfile = {
            id: profile.id,
            display_name: profile.display_name,
            username: profile.username,
            campus_short: inst?.short_name,
          };
        }
      }
    } catch {
      // Fallback
    }
  }

  return (
    <AppShell user={userProfile} activeTab="Create" headerTitle="New Post">
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "24px 16px" }}>
        <div style={{ marginBottom: 20 }}>
          <span className="eyebrow">CREATE POST</span>
          <h1 style={{ fontSize: 24, fontWeight: 600, margin: "6px 0 4px" }}>Share with your campus</h1>
          <p style={{ color: "var(--muted)", fontSize: 13, margin: 0 }}>
            Post updates, study questions, achievements, or club announcements.
          </p>
        </div>

        <CreatePostForm />
      </div>
    </AppShell>
  );
}
