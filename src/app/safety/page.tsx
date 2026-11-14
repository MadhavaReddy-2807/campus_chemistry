import Link from "next/link";
import { ModuleHeader } from "@/app/_components/DataState";

export default function SafetyPage() {
  return <main className="module-page"><div className="module-topbar"><Link href="/" className="auth-brand"><span className="brand-mark">cc</span><span>campus chemistry</span></Link><Link href="/" className="text-button">Back home <span>←</span></Link></div><ModuleHeader eyebrow="SAFETY & CONTROL" title="Connection should feel chosen, not pressured." body="Campus Chemistry keeps verification, consent, privacy, and reporting visible throughout the experience." />      <div className="safety-grid">
        <article><span>01</span><h2>Verified membership</h2><p>Institute selection is never enough. We verify ownership of a reviewed institute domain or use a private manual review path.</p></article>
        <article><span>02</span><h2>Dating is opt-in</h2><p>Social participation does not turn on dating. Dating discovery additionally requires verified membership and age eligibility of 18 or older.</p></article>
        <article><span>03</span><h2>Control stays with you</h2><p>Block, unmatch, report, limit messages, hide activity, and choose who sees your social profile.</p></article>
        <article><span>04</span><h2>Meet in the real world carefully</h2><p>Events use approximate venue details by default. Private meetup details stay restricted to authorized participants.</p></article>
      </div>
      <section style={{ maxWidth: "720px", margin: "40px auto 0", textAlign: "center" }}>
        <div className="module-card" style={{ padding: "32px", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
          <span className="eyebrow">CONFIDENTIAL REPORTING</span>
          <h2>Experienced something uncomfortable?</h2>
          <p style={{ color: "var(--muted)", fontSize: "14px", lineHeight: "1.6", maxWidth: "540px" }}>
            Submit an encrypted report directly to campus safety moderators. Reports are audited and never revealed to the reported account.
          </p>
          <Link href="/safety/report" className="primary-button" style={{ marginTop: "8px" }}>
            File a confidential report <span>→</span>
          </Link>
        </div>
      </section></main>;
}
