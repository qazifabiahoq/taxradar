import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const sections = [
  {
    title: "Acceptance of Terms",
    body: "By accessing or using TaxRadar, you agree to be bound by these Terms of Service. If you do not agree, do not use the service.",
  },
  {
    title: "Use of Service",
    body: "TaxRadar is intended for use by licensed tax professionals. You are responsible for ensuring that your use complies with all applicable laws and professional obligations.",
  },
  {
    title: "Data Responsibility",
    body: "You are responsible for obtaining proper authorization before uploading client documents. TaxRadar processes documents solely to provide the services you request.",
  },
  {
    title: "Limitation of Liability",
    body: "TaxRadar provides analysis as a professional aid tool. It does not constitute tax, legal, or financial advice. You remain responsible for all filings and professional judgments.",
  },
  {
    title: "Changes to Terms",
    body: "We may update these terms from time to time. Continued use of the service after changes constitutes acceptance. Last updated: January 2026.",
  },
];

export default function Terms() {
  return (
    <div style={{ minHeight: "100vh", background: "#0A1628", color: "#fff" }}>
      <Navbar />
      <section style={{ padding: "96px 2rem", maxWidth: 800, margin: "0 auto" }}>
        <h1 style={{ fontSize: "clamp(2rem,5vw,3.5rem)", fontWeight: 800, marginBottom: 16 }}>Terms of Service</h1>
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
