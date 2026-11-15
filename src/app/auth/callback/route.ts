import { NextResponse } from "next/server";
import { type EmailOtpType } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const token_hash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type") as EmailOtpType | null;
  const next = requestUrl.searchParams.get("next") ?? "/onboarding";
  const origin = requestUrl.origin;

  // 1. PKCE flow code exchange (default in @supabase/ssr)
  if (code) {
    try {
      const supabase = await createSupabaseServerClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        return NextResponse.redirect(`${origin}${next}`);
      }
    } catch {
      // Fall through to error redirect
    }
  }

  // 2. Token hash OTP verification (used by direct email confirmation links)
  if (token_hash && type) {
    try {
      const supabase = await createSupabaseServerClient();
      const { error } = await supabase.auth.verifyOtp({
        token_hash,
        type,
      });
      if (!error) {
        return NextResponse.redirect(`${origin}${next}`);
      }
    } catch {
      // Fall through to error redirect
    }
  }

  // 3. Error handling from searchParams
  const errorCode = requestUrl.searchParams.get("error_code");
  const errorDescription = requestUrl.searchParams.get("error_description");

  let userFriendlyError = "Your email confirmation link was invalid or has expired.";
  if (errorCode === "otp_expired") {
    userFriendlyError = "This confirmation link has expired or was already used. Please request a new confirmation email.";
  } else if (errorDescription) {
    userFriendlyError = errorDescription;
  }

  return NextResponse.redirect(
    `${origin}/login?error=${encodeURIComponent(userFriendlyError)}&expired=true`
  );
}
