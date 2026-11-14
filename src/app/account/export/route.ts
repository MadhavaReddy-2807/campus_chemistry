import { NextResponse } from "next/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  if (!hasSupabaseEnv()) return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const [profile, posts, comments, follows, events, notifications, reports, discoveryActions] = await Promise.all([
    supabase.from("profiles").select("id, username, display_name, date_of_birth, gender, pronouns, institute_id, degree, department, study_year, bio, verification_status, current_student, dating_enabled, social_visibility, dating_visibility, cross_campus_visibility, message_permission, activity_visibility, created_at, updated_at").eq("id", user.id).maybeSingle(),
    supabase.from("posts").select("id, body, audience, institute_id, created_at, updated_at, deleted_at").eq("author_id", user.id).order("created_at", { ascending: false }),
    supabase.from("comments").select("id, post_id, parent_id, body, created_at, deleted_at").eq("author_id", user.id).order("created_at", { ascending: false }),
    supabase.from("follows").select("follower_id, following_id, status, created_at").or(`follower_id.eq.${user.id},following_id.eq.${user.id}`),
    supabase.from("events").select("id, title, description, category, starts_at, ends_at, approximate_venue, capacity, visibility, status, created_at").eq("host_id", user.id).order("created_at", { ascending: false }),
    supabase.from("notifications").select("id, type, title, body, href, read_at, created_at").eq("user_id", user.id).order("created_at", { ascending: false }),
    supabase.from("reports").select("id, reported_user_id, post_id, message_id, reason, details, status, created_at, resolved_at").eq("reporter_id", user.id).order("created_at", { ascending: false }),
    supabase.from("discovery_actions").select("id, target_id, action, target_prompt_id, comment, created_at").eq("actor_id", user.id).order("created_at", { ascending: false }),
  ]);
  const payload = { exported_at: new Date().toISOString(), account_id: user.id, profile: profile.data, posts: posts.data ?? [], comments: comments.data ?? [], follows: follows.data ?? [], events: events.data ?? [], notifications: notifications.data ?? [], reports: reports.data ?? [], discovery_actions: discoveryActions.data ?? [] };
  return new NextResponse(JSON.stringify(payload, null, 2), { headers: { "Content-Type": "application/json; charset=utf-8", "Content-Disposition": `attachment; filename="campus-chemistry-data-export.json"`, "Cache-Control": "no-store" } });
}
