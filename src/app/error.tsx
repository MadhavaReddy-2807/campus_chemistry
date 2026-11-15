"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log unexpected client errors for monitoring
    console.error("Campus Chemistry client error:", error);
  }, [error]);

  return (
    <main className="module-page" style={{ display: "grid", placeItems: "center", minHeight: "80vh", textAlign: "center" }}>
      <div className="module-card" style={{ maxWidth: 480, padding: "40px 24px", margin: "auto" }}>
        <span className="brand-mark" style={{ width: 44, height: 44, fontSize: 18, margin: "0 auto 20px" }}>
          cc
        </span>
        <span className="eyebrow" style={{ color: "var(--rose)" }}>AN UNEXPECTED DRIFT</span>
        <h1 style={{ fontFamily: "Georgia, serif", fontSize: 28, margin: "12px 0 16px", fontWeight: 400 }}>
          Something went a little off track.
        </h1>
        <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.6, marginBottom: 28 }}>
          We encountered an unexpected issue while loading this campus view. Your session and safety settings remain intact.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button className="primary-button" onClick={() => reset()}>
            Try again <span>↻</span>
          </button>
          <Link href="/" className="secondary-button">
            Return to home
          </Link>
        </div>
      </div>
    </main>
  );
}
