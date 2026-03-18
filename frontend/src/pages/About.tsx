import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function About() {
  return (
    <div style={{ minHeight: "100vh", background: "#0A1628", color: "#fff" }}>
      <Navbar />
      <section style={{ padding: "96px 0", maxWidth: 800, margin: "0 auto", padding: "96px 2rem" }}>
        <h1 style={{ fontSize: "clamp(2rem,5vw,3.5rem)", fontWeight: 800, marginBottom: 24 }}>About TaxRadar</h1>
        <p style={{ color: "#8892B0", fontSize: 18, lineHeight: 1.8, marginBottom: 32 }}>
          TaxRadar was built by tax professionals for tax professionals. We understand the pressure of tax season — the volume of documents, the risk of missed items, and the time it takes to produce client-ready memos.
        </p>
        <p style={{ color: "#8892B0", fontSize: 18, lineHeight: 1.8, marginBottom: 32 }}>
          Our AI engine was trained on thousands of tax documents to accurately classify W-2s, 1099s, K-1s, and supporting schedules — then cross-check them against IRS guidelines to surface audit risks before they become problems.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))", gap: 24, marginTop: 48 }}>
          {[
            { label: "Founded", value: "2023" },
            { label: "Documents Processed", value: "500K+" },
            { label: "CPA Firms Served", value: "1,200+" },
            { label: "Audit Flags Caught", value: "98K+" },
          ].map(({ label, value }) => (
            <div key={label} style={{ background: "#112240", borderRadius: 16, padding: 32, border: "1px solid rgba(255,255,255,0.05)", textAlign: "center" }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: "#10B981", marginBottom: 8 }}>{value}</div>
              <div style={{ color: "#8892B0", fontSize: 14, fontWeight: 500 }}>{label}</div>
            </div>
          ))}
        </div>
      </section>
      <Footer />
    </div>
  );
}
