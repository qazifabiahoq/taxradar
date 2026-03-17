import { Link } from "wouter";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const fadeIn = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
};

const stagger = { animate: { transition: { staggerChildren: 0.12 } } };

const features = [
  {
    title: "Document Classification",
    desc: "Automatically identifies W-2s, 1099s, K-1s, and supporting documents without manual sorting.",
  },
  {
    title: "Income Cross-Check",
    desc: "Reconciles reported income across different forms to ensure no discrepancies trigger an audit.",
  },
  {
    title: "Deduction Risk Scoring",
    desc: "Flags aggressive deductions like home office or vehicle use that exceed industry standard benchmarks.",
  },
  {
    title: "Missing Document Detection",
    desc: "Identifies required but missing documentation based on claimed deductions and income sources.",
  },
];

const steps = [
  { step: "01", title: "Upload Documents", desc: "Drag and drop standard tax documents, PDFs, and images into the secure portal." },
  { step: "02", title: "AI Agents Analyze", desc: "Our engine reads line items, cross-checks amounts, and calculates audit risk scores." },
  { step: "03", title: "Get CPA Memo", desc: "Receive a professional, structured memo detailing red flags and missing items." },
];

export default function Landing() {
  return (
    <div style={{ minHeight: "100vh", background: "#0A1628", color: "#fff" }}>
      <Navbar />

      <section style={{ padding: "96px 0 128px", textAlign: "center", position: "relative" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 2rem" }}>
          <motion.div initial="initial" animate="animate" variants={stagger}>
            <motion.div
              variants={fadeIn}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 16px",
                borderRadius: 999,
                background: "hsla(160,84%,39%,0.1)",
                border: "1px solid hsla(160,84%,39%,0.2)",
                color: "#10B981",
                fontSize: 13,
                fontWeight: 500,
                marginBottom: 32,
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#10B981" }} />
              Tax Season 2024 Readiness Updated
            </motion.div>

            <motion.h1
              variants={fadeIn}
              style={{ fontSize: "clamp(2.5rem,6vw,5rem)", fontWeight: 800, lineHeight: 1.1, marginBottom: 24 }}
            >
              Tax Document Intelligence{" "}
              <span className="text-gradient">in Minutes.</span>
            </motion.h1>

            <motion.p
              variants={fadeIn}
              style={{ fontSize: 20, color: "#8892B0", maxWidth: 640, margin: "0 auto 40px", lineHeight: 1.7 }}
            >
              Upload client tax documents and instantly generate CPA-ready review memos, flag audit risks, and cross-check income sources. Built exclusively for tax professionals.
            </motion.p>

            <motion.div variants={fadeIn} style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/upload">
                <button style={{ background: "#10B981", color: "#0A1628", fontWeight: 700, fontSize: 16, padding: "16px 36px", borderRadius: 10, border: "none", cursor: "pointer" }}>
                  Start Free Trial
                </button>
              </Link>
              <Link href="/upload">
                <button style={{ background: "transparent", color: "#fff", fontWeight: 600, fontSize: 16, padding: "16px 36px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.15)", cursor: "pointer" }}>
                  See How It Works
                </button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section style={{ borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)", background: "hsla(218,58%,16%,0.3)", padding: "40px 0" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 2rem", display: "grid", gridTemplateColumns: "repeat(3,1fr)", textAlign: "center", gap: 32 }}>
          {[["10x", "Faster Document Review"], ["12", "Risk Categories Checked"], ["2 Min", "To Generate CPA Memos"]].map(([val, label]) => (
            <div key={label}>
              <div style={{ fontSize: 40, fontWeight: 800, marginBottom: 8 }}>{val}</div>
              <div style={{ color: "#8892B0", fontWeight: 500 }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: "96px 0" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 2rem" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 16 }}>Enterprise-Grade Analysis</h2>
            <p style={{ color: "#8892B0", fontSize: 18, maxWidth: 600, margin: "0 auto" }}>Stop hunting for missing 1099s. Our AI extracts, classifies, and cross-checks every document against IRS guidelines.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px,1fr))", gap: 32 }}>
            {features.map((f) => (
              <div key={f.title} style={{ background: "#112240", borderRadius: 16, padding: 32, border: "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: "hsla(160,84%,39%,0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>{f.title}</h3>
                <p style={{ color: "#8892B0", lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: "96px 0", background: "hsla(218,58%,16%,0.4)", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 2rem" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 16 }}>How It Works</h2>
            <p style={{ color: "#8892B0", fontSize: 18 }}>Three simple steps to an audit-ready tax file.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 48 }}>
            {steps.map((s) => (
              <div key={s.step} style={{ textAlign: "center" }}>
                <div style={{ width: 88, height: 88, borderRadius: "50%", background: "#0A1628", border: "4px solid #112240", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", fontSize: 24, fontWeight: 800, color: "#10B981" }}>{s.step}</div>
                <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>{s.title}</h3>
                <p style={{ color: "#8892B0", lineHeight: 1.7 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
