"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function sendDiscoveryAction(formData: FormData) {
  const targetId = z.string().uuid().parse(formData.get("targetId"));
  const action = z.enum(["like", "pass", "save"]).parse(formData.get("action"));
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Sign in before using discovery.");
  const { data: allowed, error: limitError } = await supabase.rpc("consume_rate_limit", { p_action: "discovery_action", p_max_count: 100, p_window_seconds: 3600 });
  if (limitError || !allowed) throw new Error("You have reached the discovery limit for now. Please try again later.");
  const { error } = await supabase.rpc("register_discovery_action", { target_id: targetId, action_name: action });
  if (error) throw new Error("That discovery action could not be saved.");
  redirect("/discover");
}
