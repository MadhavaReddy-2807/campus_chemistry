"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { authSchema } from "@/lib/validators/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AuthActionState = { error?: string; success?: string };

async function getRequestOrigin(): Promise<string> {
  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") || headerList.get("host") || "localhost:3000";
  const proto = headerList.get("x-forwarded-proto") || (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

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
    const origin = await getRequestOrigin();
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: `${origin}/auth/callback?next=/onboarding`,
      },
    });
    if (error) return { error: error.message };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Authentication is not configured yet." };
  }
  return { success: "Check your inbox to verify your email, then continue with your institute details." };
}

export async function resendConfirmation(_state: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const email = (formData.get("email") as string | null)?.trim();
  if (!email || !email.includes("@")) {
    return { error: "Please enter a valid email address to resend confirmation." };
  }
  try {
    const origin = await getRequestOrigin();
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: `${origin}/auth/callback?next=/onboarding`,
      },
    });
    if (error) return { error: error.message };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not resend confirmation email." };
  }
  return { success: "A fresh confirmation email has been sent. Please check your inbox and spam folder." };
}
