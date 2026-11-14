"use server";

import { redirect } from "next/navigation";
import { authSchema } from "@/lib/validators/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AuthActionState = { error?: string; success?: string };

export async function signIn(_state: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const parsed = authSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return { error: "Enter a valid email and a password with at least 8 characters." };
  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    if (error) return { error: "Those details could not be verified. Check your email and password." };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Authentication is not configured yet." };
  }
  redirect("/");
}

export async function signUp(_state: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const parsed = authSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return { error: "Enter a valid email and a password with at least 8 characters." };
  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.signUp({ email: parsed.data.email, password: parsed.data.password });
    if (error) return { error: error.message };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Authentication is not configured yet." };
  }
  return { success: "Check your inbox to verify your email, then continue with your institute details." };
}
