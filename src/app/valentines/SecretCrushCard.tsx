"use client";

import { useActionState } from "react";
import { submitSecretCrushAction } from "./actions";

export function SecretCrushCard() {
  const [state, formAction, pending] = useActionState(submitSecretCrushAction, null);

  return (
    <article className="module-card secret-crush-card">
      <div className="crush-card-header">
        <span className="eyebrow">MUTUAL REVEAL ONLY</span>
        <span className="crush-badge">🔒 ZERO-KNOWLEDGE</span>
      </div>
      <h2>Secret Crush Matchmaker</h2>
      <p className="crush-intro">
        Have feelings for someone on campus? Enter their institute email or handle.
        They will <strong>NEVER</strong> be notified or told you added them, unless they
        independently crush on you too!
      </p>

      <form action={formAction} className="secret-crush-form">
        <div className="crush-input-row">
          <input
            name="targetIdentifier"
            required
            placeholder="e.g. name@iitb.ac.in or @username"
            aria-label="Target student's institute email or username"
          />
          <button className="primary-button" type="submit" disabled={pending}>
            {pending ? "Sealing…" : "Seal Crush"} <span>✦</span>
          </button>
        </div>

        {state?.error && (
          <p className="form-error" role="alert">
            {state.error}
          </p>
        )}
        {state?.success && (
          <div className={`crush-result ${state.isMutual ? "mutual" : "sealed"}`} role="status">
            {state.message}
          </div>
        )}
      </form>

      <div className="crush-footer">
        <small>Limit: 3 secret crushes per student. Hashed with SHA-256 before storage.</small>
      </div>
    </article>
  );
}
