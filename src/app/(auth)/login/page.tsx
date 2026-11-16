"use client";

import Link from "next/link";
import { Suspense, useActionState, useState } from "react";
import { useSearchParams } from "next/navigation";
import { signIn, resendConfirmation, type AuthActionState } from "../auth-actions";

const initialState: AuthActionState = {};

function LoginForm() {
  const searchParams = useSearchParams();
  const urlError = searchParams.get("error") || searchParams.get("error_description");
  const isExpired = searchParams.get("expired") === "true" || searchParams.get("error_code") === "otp_expired" || (urlError && urlError.toLowerCase().includes("expired"));

  const [state, formAction, pending] = useActionState(signIn, initialState);
  const [resendState, resendAction, resendPending] = useActionState(resendConfirmation, initialState);
  const [showResend, setShowResend] = useState(Boolean(isExpired));
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="auth-card">
      <div className="auth-brand">
        <span className="brand-mark">cc</span>
        <span>campus chemistry</span>
      </div>
      <span className="eyebrow">STUDENT PORTAL</span>
      <h1>Welcome back</h1>
      <p className="auth-intro">Sign in to your verified IIT/NIT campus network.</p>

      {urlError && (
        <div className="form-error" role="alert" style={{ padding: "10px 14px", background: "#fff1f0", border: "1px solid #f2c2bd", borderRadius: 8, marginBottom: 16 }}>
          {urlError.includes("otp_expired") || urlError.includes("Email link is invalid or has expired")
            ? "Your confirmation link has expired or was already used. Request a new link below."
            : urlError}
        </div>
      )}

      {showResend ? (
        <form action={resendAction} className="auth-form">
          <label>
            Email address
            <input
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@institute.ac.in"
              required
            />
          </label>
          {resendState.error && <p className="form-error" role="alert">{resendState.error}</p>}
          {resendState.success && <p className="form-success" role="status">{resendState.success}</p>}
          <button className="primary-button" type="submit" disabled={resendPending}>
            {resendPending ? "Sending…" : "Resend confirmation email"}
          </button>
          <button
            type="button"
            className="secondary-button"
            style={{ marginTop: 8 }}
            onClick={() => setShowResend(false)}
          >
            Back to sign in
          </button>
        </form>
      ) : (
        <form action={formAction} className="auth-form">
          <label>
            Email address
            <input
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@institute.ac.in"
              required
            />
          </label>
          <label>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>Password</span>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ background: "none", border: 0, color: "var(--muted)", cursor: "pointer", fontSize: 11, padding: 0 }}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="At least 8 characters"
              required
            />
          </label>
          {state.error && <p className="form-error" role="alert">{state.error}</p>}
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: -6 }}>
            <Link href="/forgot-password" style={{ fontSize: 11, color: "var(--muted)", textDecoration: "none" }}>
              Forgot password?
            </Link>
          </div>
          <button className="primary-button" type="submit" disabled={pending}>
            {pending ? "Signing in…" : "Sign in"}
          </button>
        </form>
      )}

      <div style={{ marginTop: 20, display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12 }}>
        <p className="auth-switch" style={{ margin: 0 }}>
          New student? <Link href="/signup">Create account</Link>
        </p>
        {!showResend && (
          <button
            type="button"
            onClick={() => setShowResend(true)}
            style={{ background: "none", border: 0, color: "var(--rose)", cursor: "pointer", fontSize: 11, fontWeight: 600, padding: 0 }}
          >
            Resend email link?
          </button>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="auth-page">
      <Suspense fallback={<div className="auth-card"><p>Loading…</p></div>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
