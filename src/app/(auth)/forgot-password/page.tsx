"use client";

import Link from "next/link";
import { useActionState } from "react";
import { forgotPassword, type AuthActionState } from "../auth-actions";

const initialState: AuthActionState = {};

export default function ForgotPasswordPage() {
  const [state, formAction, pending] = useActionState(forgotPassword, initialState);

  return (
    <main className="auth-page">
      <div className="auth-card">
        <Link href="/login" className="auth-brand">
          <span className="brand-mark">cc</span>
          <span>campus chemistry</span>
        </Link>
        <span className="eyebrow">PASSWORD RECOVERY</span>
        <h1>Reset password</h1>
        <p className="auth-intro">Enter your institute email address to receive password reset instructions.</p>

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
          {state.error && <p className="form-error" role="alert">{state.error}</p>}
          {state.success && <p className="form-success" role="status">{state.success}</p>}
          <button className="primary-button" type="submit" disabled={pending}>
            {pending ? "Sending instructions…" : "Send reset link"}
          </button>
        </form>

        <p className="auth-switch" style={{ marginTop: 20 }}>
          Remember your password? <Link href="/login">Back to sign in</Link>
        </p>
      </div>
    </main>
  );
}
