"use client";

import { useState } from "react";
import Link from "next/link";

type NavItem = { label: string; icon: string };
const navItems: NavItem[] = [
  { label: "Home", icon: "⌂" },
  { label: "Discover", icon: "✦" },
  { label: "Messages", icon: "◌" },
  { label: "Meetups", icon: "◷" },
];
const interests = ["Design", "Indie music", "Night walks", "Coffee", "Startups"];

function Avatar({ initials, tone = "rose" }: { initials: string; tone?: string }) {
  return <span className={`avatar avatar-${tone}`} aria-hidden="true">{initials}</span>;
}
function SmallIcon({ children }: { children: React.ReactNode }) {
  return <span className="small-icon" aria-hidden="true">{children}</span>;
}

export default function Home() {
  const [active, setActive] = useState("Home");
  const [liked, setLiked] = useState(false);
  const [showComposer, setShowComposer] = useState(false);
  const [toast, setToast] = useState("");
  function notify(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2400);
  }

  return (
    <main className="app-shell">
      <h1 className="sr-only">Campus Chemistry home</h1>
      <aside className="sidebar" aria-label="Primary navigation">
        <div className="brand-lockup"><div className="brand-mark" aria-hidden="true">cc</div><div><div className="brand-name">campus chemistry</div><div className="brand-note">verified campus connections</div></div></div>
        <Link className="sidebar-profile" href="/profile"><Avatar initials="AS" tone="plum" /><div><strong>Arjun Shah</strong><span>IIT Bombay · 3rd year</span></div><span className="icon-button" aria-hidden="true">···</span></Link>
        <nav className="nav-list" aria-label="Primary desktop navigation">
          {navItems.map((item) => <Link key={item.label} href={item.label === "Home" ? "/" : `/${item.label.toLowerCase()}`} className={`nav-item ${active === item.label ? "is-active" : ""}`} onClick={() => setActive(item.label)} aria-current={active === item.label ? "page" : undefined}><span className="nav-symbol" aria-hidden="true">{item.icon}</span><span>{item.label}</span>{item.label === "Messages" && <span className="nav-count">2</span>}</Link>)}
        </nav>
        <div className="sidebar-divider" /><div className="section-kicker">YOUR SPACE</div>
        <nav className="nav-list secondary-nav" aria-label="Secondary navigation"><Link className="nav-item" href="/discover"><span className="nav-symbol">⌕</span><span>Explore</span></Link><button className="nav-item" onClick={() => notify("Saved posts will connect to your private bookmarks.")}><span className="nav-symbol">♡</span><span>Saved</span></button><Link className="nav-item" href="/settings"><span className="nav-symbol">⚙</span><span>Settings</span></Link></nav>
        <div className="sidebar-bottom"><div className="valentine-rail"><span className="rail-spark">✦</span><div><strong>Valentine&apos;s Week</strong><span>Find your kind of people.</span></div><button aria-label="Open Valentine's Week" onClick={() => notify("Valentine's Hub is coming in P1.")}>↗</button></div><button className="help-link" onClick={() => notify("Safety centre is available at launch.")}>Safety centre <span>↗</span></button></div>
      </aside>

      <section className="main-column">
        <header className="topbar"><div className="mobile-brand"><span className="brand-mark">cc</span><span>campus chemistry</span></div><div className="topbar-title"><span className="eyebrow">THURSDAY, 13 NOVEMBER</span><h1>Good morning, Arjun</h1></div><div className="topbar-actions"><button className="round-action" aria-label="Search" onClick={() => notify("Search will connect to database-backed results.")}>⌕</button><button className="round-action notification-action" aria-label="Notifications" onClick={() => notify("You have 3 new notifications.")}>♧<span /></button><Avatar initials="AS" tone="plum" /></div></header>
        <div className="development-banner"><span>DEVELOPMENT MODE</span> This preview uses sample campus profiles. Verification and data storage connect in the next slice.</div>
        <div className="content-grid">
          <div className="feed-column">
            <section className="intro-row"><div><span className="eyebrow">YOUR CAMPUS, YOUR PACE</span><h2>A little more <em>you</em> goes a long way.</h2></div><Link className="text-button" href="/discover">See all people <span>→</span></Link></section>
            <section className="discover-card" aria-label="Featured campus connection"><div className="discover-image"><div className="image-wash" /><div className="image-label"><span className="verified-dot">✓</span> IIT Bombay · 2 km away</div><div className="image-stamp">for<br /><strong>you</strong></div><div className="profile-photo">NS</div><div className="photo-caption"><span>01 / 04</span><span>♡</span></div></div><div className="discover-body"><div className="profile-heading"><div><h3>Naina S.</h3><p>21 · She / her · 2nd year</p></div><span className="profile-badge">✦ 92% shared vibe</span></div><p className="profile-line">“Usually found with a camera, a cup of chai, or a very ambitious weekend plan.”</p><div className="interest-row">{interests.slice(0, 4).map((interest) => <span className="interest-chip" key={interest}>{interest}</span>)}</div><div className="discover-footer"><span className="match-reason"><span>↗</span> You both like discovering new cafés</span><div className="card-actions"><button className="pass-action" onClick={() => notify("Passed for now.")} aria-label="Pass on Naina">×</button><button className={`like-action ${liked ? "is-liked" : ""}`} onClick={() => { setLiked(!liked); notify(liked ? "Like removed." : "Like sent privately."); }} aria-label="Like Naina">♡</button></div></div></div></section>
            <section className="feed-section"><div className="section-heading"><div><span className="eyebrow">FROM YOUR CAMPUS</span><h2>Moments worth sharing</h2></div><Link className="round-more" href="/feed" aria-label="Open full campus feed">→</Link></div><article className="post-card"><div className="post-head"><Avatar initials="CC" tone="sage" /><div><strong>Open the real campus feed <span className="verified-mini">✓</span></strong><span>Posts, likes, and comments are database-backed</span></div><Link className="icon-button" href="/feed" aria-label="Open feed">↗</Link></div><p className="post-copy">Share a thought, a question, or a little joy with your chosen campus audience.</p><div className="post-media"><div className="media-sun">☼</div><div className="media-horizon" /></div><div className="post-actions"><Link href="/feed"><SmallIcon>◌</SmallIcon> Open feed</Link><Link href="/create"><SmallIcon>+</SmallIcon> Create a post</Link></div></article></section>
          </div>
          <aside className="right-column"><section className="quick-card composer-card"><div className="quick-title"><span className="eyebrow">MAKE A MOMENT</span><span className="sparkle">✦</span></div><Link className="composer-button" href="/create"><Avatar initials="AS" tone="plum" /><span>Share something with your campus...</span><strong>+</strong></Link><div className="composer-tools"><span>▣ Photo</span><span>◌ Question</span><span>♧ Feeling</span></div></section><section className="quick-card events-card"><div className="section-heading compact"><div><span className="eyebrow">THIS WEEK ON CAMPUS</span><h2>Things to look forward to</h2></div><Link className="text-button" href="/meetups">All <span>→</span></Link></div><div className="event-list"><Link className="event-item" href="/meetups"><span className="event-date"><strong>—</strong><small>OPEN</small></span><span><strong>Explore real campus meetups</strong><small>Events load from your verified campus</small></span><span className="event-arrow">→</span></Link></div></section><section className="quick-card people-card"><div className="section-heading compact"><div><span className="eyebrow">PEOPLE TO SAY HI TO</span><h2>New around you</h2></div><Link className="round-more" href="/discover" aria-label="More people">···</Link></div><div className="people-list"><div className="person-row"><Avatar initials="✓" tone="sage" /><div><strong>Verified discovery</strong><span>Profiles appear after eligibility checks</span></div><Link href="/discover" aria-label="Open discovery">+</Link></div></div></section><div className="safety-note"><span className="safety-icon">✧</span><div><strong>Your comfort comes first.</strong><p>Only verified students can enter discovery. You&apos;re always in control.</p><Link href="/safety">Learn about safety <span>→</span></Link></div></div></aside>
        </div>
      </section>
      <nav className="mobile-nav" aria-label="Mobile navigation">{navItems.map((item) => <Link key={item.label} href={item.label === "Home" ? "/" : `/${item.label.toLowerCase()}`} className={active === item.label ? "is-active" : ""} onClick={() => setActive(item.label)}><span>{item.icon}</span><small>{item.label === "Messages" ? "Inbox" : item.label}</small>{item.label === "Messages" && <i>2</i>}</Link>)}<Link href="/create"><span className="mobile-create">+</span><small>Create</small></Link></nav>
      {showComposer && <div className="modal-backdrop" role="presentation" onClick={() => setShowComposer(false)}><div className="composer-modal" role="dialog" aria-modal="true" aria-labelledby="composer-title" onClick={(event) => event.stopPropagation()}><div className="modal-top"><div><span className="eyebrow">NEW CAMPUS MOMENT</span><h2 id="composer-title">What&apos;s on your mind?</h2></div><button className="round-action" onClick={() => setShowComposer(false)} aria-label="Close composer">×</button></div><textarea placeholder="A thought, a question, a little joy..." autoFocus /><div className="modal-footer"><span>Visible to your selected campus audience</span><button className="primary-button" onClick={() => { setShowComposer(false); notify("Post composer is ready for the social backend."); }}>Continue <span>→</span></button></div></div></div>}
      {toast && <div className="toast" role="status">{toast}</div>}
    </main>
  );
}
