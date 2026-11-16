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
  
  let redirectTarget = "/";
  try {
    const supabase = await createSupabaseServerClient();
    const { data: authData, error } = await supabase.auth.signInWithPassword(parsed.data);
    if (error) return { error: "Those details could not be verified. Check your email and password." };

    if (authData.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("verification_status, onboarding_completed_at")
        .eq("id", authData.user.id)
        .maybeSingle();

      if (profile?.verification_status === "suspended") {
        redirectTarget = "/suspended";
      } else if (!profile || !profile.onboarding_completed_at) {
        redirectTarget = "/onboarding";
      }
    }
  } catch (error) {
    // If it's a Next.js redirect error, re-throw it so the redirect succeeds
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error;
    }
    return { error: error instanceof Error ? error.message : "Authentication is not configured yet." };
  }
  redirect(redirectTarget);
}

export async function signUp(_state: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string | null;

  if (confirmPassword !== null && password !== confirmPassword) {
    return { error: "Passwords do not match. Please verify your passwords match." };
  }

  const parsed = authSchema.safeParse({ email: formData.get("email"), password });
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
  return { success: "Account created! Check your inbox to verify your email, then continue to onboarding." };
}

export async function forgotPassword(_state: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const email = (formData.get("email") as string | null)?.trim();
  if (!email || !email.includes("@")) {
    return { error: "Please enter your registered email address." };
  }
  try {
    const origin = await getRequestOrigin();
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/auth/callback?next=/settings`,
    });
    if (error) return { error: error.message };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Password reset could not be initiated." };
  }
  return { success: "Password reset link sent. Please check your inbox and spam folder." };
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

export async function signOutAction() {
  try {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  } catch {
    // Ignore signout error
  }
  redirect("/login");
}
