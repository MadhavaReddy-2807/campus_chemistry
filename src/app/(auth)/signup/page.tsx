"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { signUp, type AuthActionState } from "../auth-actions";

const initialState: AuthActionState = {};

export default function SignupPage() {
  const [state, formAction, pending] = useActionState(signUp, initialState);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

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
          {state.success && <p className="form-success" role="status">{state.success}</p>}

          <button className="primary-button" type="submit" disabled={pending}>
            {pending ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="auth-switch" style={{ marginTop: 20 }}>
          Already have an account? <Link href="/login">Sign in</Link>
        </p>
      </div>
    </main>
  );
}
