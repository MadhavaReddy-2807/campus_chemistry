"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signUp, type AuthActionState } from "../auth-actions";

const initialState: AuthActionState = {};

export default function SignupPage() {
  const [state, formAction, pending] = useActionState(signUp, initialState);
  return <main className="auth-page"><div className="auth-card"><Link href="/" className="auth-brand"><span className="brand-mark">cc</span><span>campus chemistry</span></Link><span className="eyebrow">A PRIVATE CAMPUS SPACE</span><h1>Make room for real connection.</h1><p className="auth-intro">Start with your institute email. Your address stays private.</p><form action={formAction} className="auth-form"><label>Institute email<input name="email" type="email" autoComplete="email" placeholder="you@institute.ac.in" required /></label><label>Create a password<input name="password" type="password" autoComplete="new-password" placeholder="At least 8 characters" required /></label>{state.error && <p className="form-error" role="alert">{state.error}</p>}{state.success && <p className="form-success" role="status">{state.success}</p>}<button className="primary-button" disabled={pending}>{pending ? "Creating account…" : "Create account"}<span>→</span></button></form><p className="auth-switch">Already have an account? <Link href="/login">Sign in</Link></p><p className="auth-footnote">Selecting IIT/NIT membership is not verification. We verify ownership of an approved institute domain before access is granted.</p></div></main>;
}
