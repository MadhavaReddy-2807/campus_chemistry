import Link from "next/link";

export default function NotFound() {
  return (
    <main className="module-page" style={{ display: "grid", placeItems: "center", minHeight: "80vh", textAlign: "center" }}>
      <div className="module-card" style={{ maxWidth: 480, padding: "40px 24px", margin: "auto" }}>
        <span className="brand-mark" style={{ width: 44, height: 44, fontSize: 18, margin: "0 auto 20px" }}>
          cc
        </span>
        <span className="eyebrow" style={{ color: "var(--rose)" }}>404 · CAMPUS PATH NOT FOUND</span>
        <h1 style={{ fontFamily: "Georgia, serif", fontSize: 32, margin: "12px 0 16px", fontWeight: 400 }}>
          This corridor seems quiet.
        </h1>
        <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.6, marginBottom: 28 }}>
          The page or profile you were looking for doesn&apos;t exist or is currently private to authorized students.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/" className="primary-button">
            Back to campus home <span>→</span>
          </Link>
          <Link href="/feed" className="secondary-button">
            Campus feed
          </Link>
        </div>
      </div>
    </main>
  );
}
