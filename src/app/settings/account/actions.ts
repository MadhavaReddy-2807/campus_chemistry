"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function requestAccountDeletion() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Sign in before requesting account deletion.");
  const { error } = await supabase.rpc("request_account_deletion");
  if (error) throw new Error("We could not submit the deletion request yet.");
  revalidatePath("/settings/account");
}
