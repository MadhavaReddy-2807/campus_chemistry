"use client";

import { useActionState } from "react";
import { saveInstituteSelection } from "./actions";
import type { InstituteSelectionState } from "@/lib/validators/onboarding";

type Institute = { id: string; official_name: string; short_name: string; city: string; state: string; institute_type: "IIT" | "NIT" };
const initialState: InstituteSelectionState = {};

export function InstitutePicker({ institutes }: { institutes: Institute[] }) {
  const [state, formAction, pending] = useActionState(saveInstituteSelection, initialState);
  if (institutes.length === 0) return <div className="directory-empty"><strong>Institute directory is being prepared.</strong><p>We only publish domains after verifying them against official institute sources. Add Supabase credentials and the reviewed directory seed to continue.</p></div>;
  return <form action={formAction} className="institute-picker"><label>Search your institute<input aria-label="Search institutes" placeholder="Search IIT or NIT" onChange={(event) => { const query = event.target.value.toLowerCase(); document.querySelectorAll<HTMLElement>("[data-institute]").forEach((item) => { item.hidden = !item.dataset.institute?.includes(query); }); }} /></label><div className="onboarding-options">{institutes.map((institute) => <label className="institute-option" data-institute={`${institute.official_name} ${institute.short_name} ${institute.city}`.toLowerCase()} key={institute.id}><input type="radio" name="instituteId" value={institute.id} required /><span className={`institute-type ${institute.institute_type === "NIT" ? "nit" : ""}`}>{institute.institute_type}</span><span><strong>{institute.official_name}</strong><small>{institute.short_name} · {institute.city}, {institute.state}</small></span><span>→</span></label>)}</div>{state.error && <p className="form-error" role="alert">{state.error}</p>}<button className="primary-button" disabled={pending}>{pending ? "Saving…" : "Continue"}<span>→</span></button></form>;
}
