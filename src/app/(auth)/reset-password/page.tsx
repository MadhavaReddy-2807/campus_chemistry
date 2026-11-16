"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { resetPassword, type AuthActionState } from "../auth-actions";

const initialState: AuthActionState = {};

export default function ResetPasswordPage() {
  const [state, formAction, pending] = useActionState(resetPassword, initialState);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <main className="auth-page">
      <div className="auth-card">
        <Link href="/login" className="auth-brand">
          <span className="brand-mark">cc</span>
          <span>campus chemistry</span>
        </Link>
        <span className="eyebrow">ACCOUNT RECOVERY</span>
        <h1>Choose a new password</h1>
        <p className="auth-intro">Enter your new secure password below to regain access.</p>

        {state.success ? (
          <div style={{ marginTop: 20 }}>
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
                Password updated
              </h2>
              <p style={{ fontSize: 13, color: "#15803d", margin: "0 0 16px", lineHeight: 1.5 }}>
                {state.success}
              </p>
              <Link href="/login" className="primary-button" style={{ display: "inline-block", fontSize: 13 }}>
                Sign in with new password
              </Link>
            </div>
          </div>
        ) : (
          <form action={formAction} className="auth-form">
            <label>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>New password</span>
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
                <span>Confirm new password</span>
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
                placeholder="Re-enter new password"
                required
              />
            </label>

            {state.error && <p className="form-error" role="alert">{state.error}</p>}

            <button className="primary-button" type="submit" disabled={pending}>
              {pending ? "Updating password…" : "Save new password"}
            </button>
          </form>
        )}

        <p className="auth-switch" style={{ marginTop: 20 }}>
          Remember your password? <Link href="/login">Sign in</Link>
        </p>
      </div>
    </main>
  );
}
