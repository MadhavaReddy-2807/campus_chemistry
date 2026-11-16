"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function updateStudentProfile(formData: FormData) {
  const displayName = formData.get("displayName")?.toString().trim();
  const bio = formData.get("bio")?.toString().trim() ?? "";
  const studyYear = formData.get("studyYear") ? parseInt(formData.get("studyYear") as string, 10) : 1;
  const avatarUrl = formData.get("avatarUrl")?.toString().trim() || null;
  const interestsRaw = formData.getAll("interests") as string[];

  if (!displayName || displayName.length < 2) {
    throw new Error("Full name must be at least 2 characters.");
  }

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Please sign in to update your profile.");

  // Update profile record via secure RPC
  const { error: profileError } = await supabase.rpc("update_student_profile", {
    p_display_name: displayName,
    p_username: "",
    p_bio: bio.slice(0, 500),
    p_study_year: Math.min(Math.max(studyYear, 1), 7),
    p_avatar_url: avatarUrl,
  });

  if (profileError) {
    // Fallback direct update
    await supabase.from("profiles").update({
      display_name: displayName,
      bio: bio.slice(0, 500),
      study_year: Math.min(Math.max(studyYear, 1), 7),
      avatar_url: avatarUrl,
      updated_at: new Date().toISOString(),
    }).eq("id", user.id);
  }

  // Update interests
  if (interestsRaw.length > 0) {
    await supabase.from("user_interests").delete().eq("user_id", user.id);
    const rows = interestsRaw.map((id) => ({
      user_id: user.id,
      interest_id: id,
    }));
    await supabase.from("user_interests").insert(rows);
  }

  revalidatePath("/profile");
  revalidatePath("/edit-profile");
  redirect("/profile");
}

export async function toggleFollow(formData: FormData) {
  const targetId = z.string().uuid().parse(formData.get("targetId"));
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Sign in before following someone.");
  if (user.id === targetId) throw new Error("You cannot follow your own profile.");

  const { data: existing } = await supabase
    .from("follows")
    .select("follower_id")
    .eq("follower_id", user.id)
    .eq("following_id", targetId)
    .maybeSingle();

  if (existing) {
    await supabase.from("follows").delete().eq("follower_id", user.id).eq("following_id", targetId);
  } else {
    await supabase.from("follows").insert({
      follower_id: user.id,
      following_id: targetId,
      status: "active",
    });

    // Notify the user of new follower
    const { data: followerProfile } = await supabase.from("profiles").select("display_name").eq("id", user.id).maybeSingle();
    await supabase.from("notifications").insert({
      user_id: targetId,
      type: "follow",
      title: "New Follower",
      body: `${followerProfile?.display_name || "A student"} started following you`,
      href: `/profile?user=${user.id}`,
    });
  }

  revalidatePath(`/profile?user=${targetId}`);
  revalidatePath("/profile");
}

export async function startDirectConversation(targetUserId: string) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Sign in to start a conversation.");

  const { data: conversationId, error } = await supabase.rpc("get_or_create_direct_conversation", {
    target_user_id: targetUserId,
  });

  if (error || !conversationId) {
    throw new Error(error?.message || "Could not open conversation.");
  }

  redirect(`/messages/${conversationId}`);
}

export async function blockUser(targetUserId: string) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Sign in to block a user.");

  await supabase.from("blocks").insert({
    blocker_id: user.id,
    blocked_id: targetUserId,
  });

  // Remove follows if any
  await supabase.from("follows").delete().or(`and(follower_id.eq.${user.id},following_id.eq.${targetUserId}),and(follower_id.eq.${targetUserId},following_id.eq.${user.id})`);

  revalidatePath(`/profile?user=${targetUserId}`);
  redirect("/feed");
}

export async function reportUser(formData: FormData) {
  const reportedUserId = formData.get("reportedUserId")?.toString();
  const reason = formData.get("reason")?.toString() || "Inappropriate behavior";
  const details = formData.get("details")?.toString() || "";

  if (!reportedUserId) throw new Error("Invalid report target.");

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Sign in to report a user.");

  await supabase.from("reports").insert({
    reporter_id: user.id,
    reported_user_id: reportedUserId,
    reason,
    details,
    status: "open",
  });

  revalidatePath(`/profile?user=${reportedUserId}`);
}
