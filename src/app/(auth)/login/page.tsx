"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signIn, type AuthActionState } from "../auth-actions";

const initialState: AuthActionState = {};

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(signIn, initialState);
  return <main className="auth-page"><div className="auth-card"><Link href="/" className="auth-brand"><span className="brand-mark">cc</span><span>campus chemistry</span></Link><span className="eyebrow">WELCOME BACK</span><h1>Good to see you.</h1><p className="auth-intro">Sign in to your verified campus space.</p><form action={formAction} className="auth-form"><label>Email address<input name="email" type="email" autoComplete="email" placeholder="you@institute.ac.in" required /></label><label>Password<input name="password" type="password" autoComplete="current-password" placeholder="At least 8 characters" required /></label>{state.error && <p className="form-error" role="alert">{state.error}</p>}<button className="primary-button" disabled={pending}>{pending ? "Signing in…" : "Sign in"}<span>→</span></button></form><p className="auth-switch">New here? <Link href="/signup">Create your account</Link></p><p className="auth-footnote">Social participation and dating consent are separate choices. Dating discovery is only available to verified users aged 18+.</p></div></main>;
}
