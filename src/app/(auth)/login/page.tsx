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

  return (
    <div className="auth-card">
      <Link href="/" className="auth-brand">
        <span className="brand-mark">cc</span>
        <span>campus chemistry</span>
      </Link>
      <span className="eyebrow">WELCOME BACK</span>
      <h1>Good to see you.</h1>
      <p className="auth-intro">Sign in to your verified campus space.</p>

      {urlError && (
        <div
          className="form-error"
          role="alert"
          style={{
            padding: "12px 14px",
            background: "#fff1f0",
            border: "1px solid #f2c2bd",
            borderRadius: 8,
            marginBottom: 16,
            fontSize: 12,
            lineHeight: 1.45,
          }}
        >
          <strong>Notice: </strong>
          {urlError.includes("otp_expired") || urlError.includes("Email link is invalid or has expired")
            ? "Your email confirmation link has expired or was already used. You can resend a fresh confirmation link below."
            : urlError}
        </div>
      )}

      {showResend ? (
        <form action={resendAction} className="auth-form" style={{ marginBottom: 20 }}>
          <label>
            Email address to resend confirmation
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
          <button className="primary-button" disabled={resendPending}>
            {resendPending ? "Sending…" : "Resend confirmation email"}
            <span>→</span>
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
            Password
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="At least 8 characters"
              required
            />
          </label>
          {state.error && <p className="form-error" role="alert">{state.error}</p>}
          <button className="primary-button" disabled={pending}>
            {pending ? "Signing in…" : "Sign in"}
            <span>→</span>
          </button>
        </form>
      )}

      <div style={{ marginTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11 }}>
        <p className="auth-switch" style={{ margin: 0 }}>
          New here? <Link href="/signup">Create account</Link>
        </p>
        {!showResend && (
          <button
            type="button"
            onClick={() => setShowResend(true)}
            style={{
              background: "none",
              border: 0,
              color: "var(--rose)",
              cursor: "pointer",
              fontSize: 11,
              fontWeight: 600,
              padding: 0,
            }}
          >
            Resend email link?
          </button>
        )}
      </div>

      <p className="auth-footnote">
        Social participation and dating consent are separate choices. Dating discovery is only available to verified users aged 18+.
      </p>
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
