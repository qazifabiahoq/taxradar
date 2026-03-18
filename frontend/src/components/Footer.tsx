import { Link } from "wouter";

export default function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid rgba(255,255,255,0.05)",
        background: "hsla(218,58%,16%,0.3)",
        padding: "64px 0 32px",
        marginTop: 96,
      }}
    >
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 2rem" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr",
            gap: 48,
            marginBottom: 48,
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="2" /><path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14" />
              </svg>
              <span style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>TaxRadar</span>
            </div>
            <p style={{ color: "#8892B0", fontSize: 14, lineHeight: 1.7, maxWidth: 320 }}>
              Audit-ready in minutes. Built exclusively for tax professionals to accelerate document review and mitigate risk.
            </p>
          </div>
          <div>
            <h4 style={{ color: "#fff", fontWeight: 600, marginBottom: 16, fontSize: 14 }}>Product</h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 12 }}>
              <li><Link href="/#features" style={{ color: "#8892B0", fontSize: 14, textDecoration: "none" }}>Features</Link></li>
              <li><Link href="/pricing" style={{ color: "#8892B0", fontSize: 14, textDecoration: "none" }}>Pricing</Link></li>
              <li><Link href="/security" style={{ color: "#8892B0", fontSize: 14, textDecoration: "none" }}>Security</Link></li>
            </ul>
          </div>
          <div>
            <h4 style={{ color: "#fff", fontWeight: 600, marginBottom: 16, fontSize: 14 }}>Company</h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 12 }}>
              <li><Link href="/about" style={{ color: "#8892B0", fontSize: 14, textDecoration: "none" }}>About</Link></li>
              <li><Link href="/contact" style={{ color: "#8892B0", fontSize: 14, textDecoration: "none" }}>Contact</Link></li>
              <li><Link href="/privacy" style={{ color: "#8892B0", fontSize: 14, textDecoration: "none" }}>Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.05)",
            paddingTop: 32,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            color: "#8892B0",
            fontSize: 13,
          }}
        >
          <p>© {new Date().getFullYear()} TaxRadar Inc. All rights reserved.</p>
          <div style={{ display: "flex", gap: 24 }}>
            <Link href="/terms" style={{ color: "#8892B0", textDecoration: "none" }}>Terms of Service</Link>
            <Link href="/privacy" style={{ color: "#8892B0", textDecoration: "none" }}>Privacy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
