"use client";

import { useState, useActionState } from "react";
import { saveDateSafetyPlanAction } from "./actions";

export function DateSafetyModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction, pending] = useActionState(saveDateSafetyPlanAction, null);

  const [buddyPhone, setBuddyPhone] = useState("");
  const [venue, setVenue] = useState("");
  const [time, setTime] = useState("");

  const shareText = encodeURIComponent(
    `Hey, I'm heading out on a campus meetup at ${venue || "the café"} around ${time || "tonight"}. If I don't check in with you by our agreed time, please give me a call! (Campus Chemistry Date Safety Kit)`
  );
  const whatsappUrl = `https://wa.me/${buddyPhone.replace(/\D/g, "")}?text=${shareText}`;

  return (
    <>
      <button className="primary-button" onClick={() => setIsOpen(true)}>
        Create Date Safety Plan <span>🛡</span>
      </button>

      {isOpen && (
        <div className="modal-backdrop" onClick={() => setIsOpen(false)}>
          <div className="composer-modal safety-plan-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-top">
              <div>
                <span className="eyebrow">CAMPUS DATE SAFETY KIT</span>
                <h2>Keep a friend in the loop.</h2>
              </div>
              <button className="round-action" onClick={() => setIsOpen(false)}>
                ✕
              </button>
            </div>

            <p style={{ color: "var(--muted)", fontSize: "12px", lineHeight: "1.5" }}>
              Meeting someone new in person should always feel comfortable and safe. Record your meetup
              venue and share a pre-filled check-in message with your hostel roommate or trusted friend.
            </p>

            <form action={formAction} className="safety-plan-form">
              <label>
                <strong>Trusted Friend / Buddy Name</strong>
                <input name="buddyName" required placeholder="e.g. Priyanshu (Hostel 9 Room 302)" />
              </label>

              <label>
                <strong>Friend&apos;s Phone Number</strong>
                <input
                  name="buddyContact"
                  required
                  placeholder="+91 98765 43210"
                  value={buddyPhone}
                  onChange={(e) => setBuddyPhone(e.target.value)}
                />
              </label>

              <div className="form-two-column">
                <label>
                  <strong>Meetup Venue</strong>
                  <input
                    name="venue"
                    required
                    placeholder="e.g. Nescafe corner / SAC grounds"
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                  />
                </label>

                <label>
                  <strong>Meetup Date & Time</strong>
                  <input
                    type="datetime-local"
                    name="meetTime"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                  />
                </label>
              </div>

              <label>
                <strong>Emergency Notes / Check-in Deadline</strong>
                <textarea
                  name="emergencyNotes"
                  rows={2}
                  placeholder="e.g. If I don't message you by 10:30 PM, call me twice."
                />
              </label>

              {state?.error && <p className="form-error">{state.error}</p>}
              {state?.success && <p className="form-success">{state.message}</p>}

              <div className="modal-footer" style={{ marginTop: "1rem" }}>
                {buddyPhone && (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="secondary-button"
                  >
                    Share via WhatsApp <span>↗</span>
                  </a>
                )}
                <button className="primary-button" type="submit" disabled={pending}>
                  {pending ? "Saving…" : "Activate Plan"} <span>→</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
