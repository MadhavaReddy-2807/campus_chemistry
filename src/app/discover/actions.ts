"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function sendDiscoveryAction(
  targetId: string,
  actionName: "like" | "pass"
): Promise<{ matchId?: string; conversationId?: string } | null> {
  const targetParsed = z.string().uuid().parse(targetId);
  const actionParsed = z.enum(["like", "pass"]).parse(actionName);

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Sign in before using dating discovery.");

  // Register discovery action in database
  const { error: rpcError } = await supabase.rpc("register_discovery_action", {
    target_id: targetParsed,
    action_name: actionParsed,
  });

  if (rpcError) {
    // Direct upsert fallback
    await supabase.from("discovery_actions").upsert(
      {
        actor_id: user.id,
        target_id: targetParsed,
        action: actionParsed,
        created_at: new Date().toISOString(),
      },
      { onConflict: "actor_id,target_id" }
    );
  }

  // Check if a mutual match exists
  if (actionParsed === "like") {
    const { data: match } = await supabase
      .from("matches")
      .select("id")
      .or(`and(user_a.eq.${user.id},user_b.eq.${targetParsed}),and(user_a.eq.${targetParsed},user_b.eq.${user.id})`)
      .maybeSingle();

    if (match) {
      // Look for the conversation
      const { data: myConvs } = await supabase
        .from("conversation_members")
        .select("conversation_id")
        .eq("user_id", user.id);

      const convIds = (myConvs || []).map((m) => m.conversation_id);
      let conversationId: string | undefined;

      if (convIds.length > 0) {
        const { data: peerConv } = await supabase
          .from("conversation_members")
          .select("conversation_id")
          .eq("user_id", targetParsed)
          .in("conversation_id", convIds)
          .maybeSingle();

        conversationId = peerConv?.conversation_id;
      }

      if (!conversationId) {
        // Create conversation if not created yet
        const { data: newConv } = await supabase
          .from("conversations")
          .insert({ type: "direct", created_at: new Date().toISOString() })
          .select("id")
          .single();

        if (newConv) {
          conversationId = newConv.id;
          await supabase.from("conversation_members").insert([
            { conversation_id: newConv.id, user_id: user.id },
            { conversation_id: newConv.id, user_id: targetParsed },
          ]);
        }
      }

      revalidatePath("/discover");
      revalidatePath("/messages");
      return { matchId: match.id, conversationId };
    }
  }

  revalidatePath("/discover");
  return null;
}

export async function toggleDatingOptIn(enabled: boolean) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Sign in before changing dating status.");

  await supabase
    .from("profiles")
    .update({
      dating_enabled: enabled,
      dating_visibility: enabled,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  revalidatePath("/discover");
}
