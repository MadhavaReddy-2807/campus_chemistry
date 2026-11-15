"use client";

import Link from "next/link";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, -apple-system, sans-serif", background: "#f8f6f2", color: "#22201d", display: "grid", placeItems: "center", minHeight: "100vh", padding: 20 }}>
        <div style={{ maxWidth: 440, textAlign: "center", background: "#fff", padding: "36px 24px", borderRadius: 16, border: "1px solid #ebd3cd", boxShadow: "0 10px 30px rgba(0,0,0,0.06)" }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: "#6e2d3a", color: "#fff", display: "grid", placeItems: "center", margin: "0 auto 16px", fontWeight: "bold" }}>
            cc
          </div>
          <h1 style={{ fontFamily: "Georgia, serif", fontSize: 24, margin: "0 0 12px", fontWeight: 400 }}>
            Unable to connect to campus
          </h1>
          <p style={{ color: "#7a6f69", fontSize: 13, lineHeight: 1.5, margin: "0 0 24px" }}>
            A core application exception occurred. Please try reloading or check your network connection.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <button
              onClick={() => reset()}
              style={{ padding: "10px 18px", borderRadius: 8, background: "#6e2d3a", color: "#fff", border: 0, fontWeight: 600, cursor: "pointer", fontSize: 13 }}
            >
              Reload application
            </button>
            <Link
              href="/"
              style={{ padding: "10px 18px", borderRadius: 8, background: "#f5f0eb", color: "#4a423e", textDecoration: "none", border: "1px solid #ded6d0", fontWeight: 600, fontSize: 13 }}
            >
              Home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
