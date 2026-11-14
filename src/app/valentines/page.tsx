import Link from "next/link";
import { ModuleHeader } from "@/app/_components/DataState";
import { valentinesCampaign } from "@/lib/config/campaign";
import { ValentinesCountdown } from "./ValentinesCountdown";
import { SecretCrushCard } from "./SecretCrushCard";
import { DateSafetyModal } from "./DateSafetyModal";

export default function ValentinesPage() {
  return (
    <main className="module-page campaign-page">
      <div className="module-topbar">
        <Link href="/" className="auth-brand">
          <span className="brand-mark">cc</span>
          <span>campus chemistry</span>
        </Link>
        <div className="topbar-actions">
          <Link href="/meetups" className="text-button">
            Meetups <span>→</span>
          </Link>
          <Link href="/" className="text-button module-back">
            Home <span>←</span>
          </Link>
        </div>
      </div>

      <section className="campaign-hero">
        <span className="eyebrow">FEBRUARY 7–14, {valentinesCampaign.year}</span>
        <h1>A week for finding your kind of people.</h1>
        <p>Romantic, friendly, curious, or entirely your own. Campus Chemistry gives you room to choose.</p>
        <ValentinesCountdown />
      </section>

      {/* Secret Crush & Mutual Reveal Feature */}
      <section style={{ maxWidth: "720px", margin: "40px auto" }}>
        <SecretCrushCard />
      </section>

      <ModuleHeader
        eyebrow="THE WEEK, YOUR WAY"
        title="Small prompts. Real conversations."
        body="These themes are optional. Every interaction should be mutual, comfortable, and easy to leave."
      />

      <section className="campaign-days">
        {valentinesCampaign.days.map((day) => (
          <article className="module-card campaign-day" key={day.date}>
            <span className="eyebrow">{day.date}</span>
            <h2>{day.title}</h2>
            <p>{day.tone}</p>
          </article>
        ))}
      </section>

      <section className="campaign-grid">
        <article className="module-card">
          <span className="eyebrow">CAMPUS SAFETY FIRST</span>
          <h2>Campus Date Safety Kit</h2>
          <p style={{ color: "var(--muted)", fontSize: "13px", lineHeight: "1.5", margin: "10px 0 18px" }}>
            Heading out for coffee, a sunset walk, or an inter-hostel meetup? Share your plan with a trusted hostel friend.
          </p>
          <DateSafetyModal />
        </article>

        <article className="module-card">
          <span className="eyebrow">ICEBREAKERS</span>
          <h2>Start somewhere easy.</h2>
          <div className="interest-row">
            {valentinesCampaign.icebreakers.map((prompt) => (
              <span className="interest-chip" key={prompt}>
                {prompt}
              </span>
            ))}
          </div>
          <Link href="/discover" className="secondary-button" style={{ marginTop: "1rem", display: "inline-block" }}>
            Open discovery <span>→</span>
          </Link>
        </article>
      </section>

      <p className="onboarding-note campaign-safety">
        Safety first: never share private verification documents, exact locations, or intimate content without clear consent. Use the safety centre to block or report unwanted contact.
      </p>
    </main>
  );
}
