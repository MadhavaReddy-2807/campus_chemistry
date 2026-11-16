import Link from "next/link";
import { signOutAction } from "@/app/(auth)/auth-actions";

export default function SuspendedPage() {
  return (
    <main className="auth-page">
      <div className="auth-card" style={{ maxWidth: 460, textAlign: "center" }}>
        <div className="brand-mark" style={{ width: 44, height: 44, margin: "0 auto 16px" }}>
          cc
        </div>
        <span className="eyebrow" style={{ color: "#a34c4e" }}>ACCOUNT NOTICE</span>
        <h1 style={{ fontSize: 26, margin: "12px 0 16px" }}>Access restricted</h1>
        <p style={{ color: "var(--muted)", fontSize: 13, lineHeight: 1.6, marginBottom: 24 }}>
          This campus account has been suspended due to verified community guideline violations or a pending safety review.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <Link href="/safety" className="secondary-button">
            Community guidelines
          </Link>
          <form action={signOutAction}>
            <button className="primary-button" type="submit">
              Sign out
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
