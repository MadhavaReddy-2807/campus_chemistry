"use client";

import Link from "next/link";
import { useActionState, useState, useEffect } from "react";
import { signUp, resendConfirmation, type AuthActionState } from "../auth-actions";

const initialState: AuthActionState = {};

export default function SignupPage() {
  const [state, formAction, pending] = useActionState(signUp, initialState);
  const [resendState, resendAction, resendPending] = useActionState(resendConfirmation, initialState);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // If signup succeeded, start a 60-second cooldown timer for resend
  useEffect(() => {
    if (state.success || resendState.success) {
      const target = Date.now() + 60000;
      const initTimer = setTimeout(() => setCooldown(60), 0);
      const timer = setInterval(() => {
        const remaining = Math.max(0, Math.ceil((target - Date.now()) / 1000));
        setCooldown(remaining);
        if (remaining === 0) {
          clearInterval(timer);
        }
      }, 500);
      return () => {
        clearTimeout(initTimer);
        clearInterval(timer);
      };
    }
  }, [state.success, resendState.success]);

  const emailSentTo = state.email || resendState.email;

  return (
    <main className="auth-page">
      <div className="auth-card">
        <Link href="/login" className="auth-brand">
          <span className="brand-mark">cc</span>
          <span>campus chemistry</span>
        </Link>
        <span className="eyebrow">NEW STUDENT REGISTRATION</span>
        <h1>Create account</h1>
        <p className="auth-intro">Sign up using your official IIT/NIT institute email.</p>

        {state.success ? (
          <div className="confirmation-pending-box" style={{ marginTop: 20 }}>
            <div
              style={{
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                borderRadius: 12,
                padding: "20px",
                textAlign: "left",
                marginBottom: 20,
              }}
            >
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "#166534", margin: "0 0 8px" }}>
                Check your inbox
              </h2>
              <p style={{ fontSize: 13, color: "#15803d", margin: "0 0 12px", lineHeight: 1.5 }}>
                {state.success}
              </p>
              {emailSentTo && (
                <p style={{ fontSize: 12, color: "#166534", margin: "0 0 16px", fontWeight: 600 }}>
                  Sent to: <code>{emailSentTo}</code>
                </p>
              )}

              {state.isExisting ? (
                <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                  <Link href="/login" className="primary-button" style={{ fontSize: 12, padding: "8px 16px" }}>
                    Sign in
                  </Link>
                  <Link href="/forgot-password" className="secondary-button" style={{ fontSize: 12, padding: "8px 16px" }}>
                    Reset password
                  </Link>
                </div>
              ) : (
                <form action={resendAction} style={{ marginTop: 14 }}>
                  <input type="hidden" name="email" value={emailSentTo || ""} />
                  <button
                    type="submit"
                    className="secondary-button"
                    disabled={resendPending || cooldown > 0}
                    style={{ fontSize: 12, padding: "8px 16px" }}
                  >
                    {resendPending
                      ? "Sending..."
                      : cooldown > 0
                      ? `Resend available in ${cooldown}s`
                      : "Resend confirmation email"}
                  </button>
                </form>
              )}
            </div>

            {resendState.error && (
              <p className="form-error" role="alert" style={{ marginBottom: 16 }}>
                {resendState.error}
              </p>
            )}
            {resendState.success && (
              <p className="form-success" role="status" style={{ marginBottom: 16 }}>
                {resendState.success}
              </p>
            )}

            <p className="auth-switch">
              Already confirmed? <Link href="/login">Sign in to continue</Link>
            </p>
          </div>
        ) : (
          <form action={formAction} className="auth-form">
            <label>
              Institute email
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
                <span>Create password</span>
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
                autoComplete="new-password"
                placeholder="At least 8 characters"
                required
              />
            </label>
            <label>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>Confirm password</span>
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  style={{ background: "none", border: 0, color: "var(--muted)", cursor: "pointer", fontSize: 11, padding: 0 }}
                  aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
                >
                  {showConfirm ? "Hide" : "Show"}
                </button>
              </div>
              <input
                name="confirmPassword"
                type={showConfirm ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Re-enter your password"
                required
              />
            </label>

            {state.error && <p className="form-error" role="alert">{state.error}</p>}

            <button className="primary-button" type="submit" disabled={pending}>
              {pending ? "Creating account…" : "Create account"}
            </button>
          </form>
        )}

        <p className="auth-switch" style={{ marginTop: 20 }}>
          Already have an account? <Link href="/login">Sign in</Link>
        </p>
      </div>
    </main>
  );
}
