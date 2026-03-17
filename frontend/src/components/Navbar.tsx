import { Link, useLocation } from "wouter";

export default function Navbar() {
  const [location] = useLocation();

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        width: "100%",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        background: "hsla(216,60%,10%,0.85)",
        backdropFilter: "blur(12px)",
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "0 2rem",
          height: 72,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <div
            style={{
              background: "hsla(160,84%,39%,0.15)",
              borderRadius: 12,
              padding: 8,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="2" /><path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14" />
            </svg>
          </div>
          <span style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>
            Tax<span style={{ color: "#10B981" }}>Radar</span>
          </span>
        </Link>

        <nav style={{ display: "flex", gap: 32, fontSize: 14, fontWeight: 500 }}>
          <Link href="/" style={{ color: "#8892B0", textDecoration: "none" }}>Features</Link>
          <Link href="/pricing" style={{ color: "#8892B0", textDecoration: "none" }}>Pricing</Link>
          <Link href="/upload" style={{ color: "#8892B0", textDecoration: "none" }}>How It Works</Link>
        </nav>

        <Link href="/upload" style={{ textDecoration: "none" }}>
          <button
            style={{
              background: "#10B981",
              color: "#0A1628",
              fontWeight: 700,
              fontSize: 14,
              padding: "10px 24px",
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
            }}
          >
            Start Free Trial
          </button>
        </Link>
      </div>
    </header>
  );
}
