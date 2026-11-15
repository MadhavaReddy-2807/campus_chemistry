export default function Loading() {
  return (
    <main className="module-page" style={{ display: "grid", placeItems: "center", minHeight: "60vh" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
        <div
          className="brand-mark"
          style={{
            width: 44,
            height: 44,
            fontSize: 18,
            animation: "pulse 1.6s infinite ease-in-out",
          }}
          aria-hidden="true"
        >
          cc
        </div>
        <span className="eyebrow" style={{ letterSpacing: "0.15em", color: "var(--soft)" }}>
          CONNECTING TO CAMPUS...
        </span>
      </div>
    </main>
  );
}
