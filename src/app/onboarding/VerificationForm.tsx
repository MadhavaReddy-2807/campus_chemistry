"use client";

import { useActionState } from "react";
import { requestInstituteVerification } from "./actions";
import type { VerificationRequestState } from "@/lib/validators/onboarding";

export function VerificationForm({ instituteId }: { instituteId: string }) {
  const [state, formAction, pending] = useActionState(requestInstituteVerification, {} as VerificationRequestState);
  return <form action={formAction} className="auth-form"><input type="hidden" name="instituteId" value={instituteId} /><label htmlFor="institute-email">Institute email</label><input id="institute-email" name="email" type="email" required maxLength={254} autoComplete="email" placeholder="you@institute.edu" />{state.error && <p className="form-error" role="alert">{state.error}</p>}{state.success && <p className="form-success" role="status">{state.success}</p>}<button className="primary-button" disabled={pending}>{pending ? "Checking…" : "Continue verification"}<span>→</span></button></form>;
}
