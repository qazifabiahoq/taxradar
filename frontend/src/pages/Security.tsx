import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const items = [
  {
    title: "AES-256 Encryption",
    desc: "All documents and data are encrypted at rest using AES-256 and in transit using TLS 1.3.",
  },
  {
    title: "SOC 2 Type II",
    desc: "Our infrastructure meets SOC 2 Type II standards for security, availability, and confidentiality.",
  },
  {
    title: "Zero Data Retention",
    desc: "Uploaded documents are automatically purged after 30 days. You can also trigger immediate deletion at any time.",
  },
  {
    title: "Role-Based Access",
    desc: "Strict access controls ensure only authenticated users can access their own documents and reports.",
  },
];

export default function Security() {
  return (
    <div style={{ minHeight: "100vh", background: "#0A1628", color: "#fff" }}>
      <Navbar />
      <section style={{ padding: "96px 2rem", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <h1 style={{ fontSize: "clamp(2rem,5vw,3.5rem)", fontWeight: 800, marginBottom: 16 }}>Security at TaxRadar</h1>
          <p style={{ color: "#8892B0", fontSize: 18, maxWidth: 600, margin: "0 auto", lineHeight: 1.7 }}>
            Your clients' financial data is among the most sensitive information that exists. We treat it that way.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px,1fr))", gap: 32 }}>
          {items.map((item) => (
            <div key={item.title} style={{ background: "#112240", borderRadius: 16, padding: 32, border: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: "hsla(160,84%,39%,0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>{item.title}</h3>
              <p style={{ color: "#8892B0", lineHeight: 1.7 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
      <Footer />
    </div>
  );
}
