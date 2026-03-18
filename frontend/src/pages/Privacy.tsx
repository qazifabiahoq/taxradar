import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const sections = [
  {
    title: "Information We Collect",
    body: "We collect tax documents and related files you upload, your account details (name, email, firm name), and usage data to improve our service. We do not sell your data to third parties.",
  },
  {
    title: "How We Use Your Data",
    body: "Uploaded documents are processed solely to generate your requested analysis memos. Documents are encrypted in transit and at rest, and are automatically purged after 30 days unless you choose to retain them.",
  },
  {
    title: "Data Security",
    body: "TaxRadar uses AES-256 encryption, SOC 2 Type II compliant infrastructure, and strict access controls. Only you can access your uploaded documents and generated reports.",
  },
  {
    title: "Your Rights",
    body: "You may request deletion of your account and all associated data at any time by contacting support. We will process deletion requests within 5 business days.",
  },
  {
    title: "Contact",
    body: "For privacy questions or requests, email privacy@taxradar.com. Last updated: January 2026.",
  },
];

export default function Privacy() {
  return (
    <div style={{ minHeight: "100vh", background: "#0A1628", color: "#fff" }}>
      <Navbar />
      <section style={{ padding: "96px 2rem", maxWidth: 800, margin: "0 auto" }}>
        <h1 style={{ fontSize: "clamp(2rem,5vw,3.5rem)", fontWeight: 800, marginBottom: 16 }}>Privacy Policy</h1>
        <p style={{ color: "#8892B0", fontSize: 16, marginBottom: 64 }}>Effective January 1, 2026</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
          {sections.map((s) => (
            <div key={s.title}>
              <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, color: "#ccd6f6" }}>{s.title}</h2>
              <p style={{ color: "#8892B0", fontSize: 16, lineHeight: 1.8 }}>{s.body}</p>
            </div>
          ))}
        </div>
      </section>
      <Footer />
    </div>
  );
}
