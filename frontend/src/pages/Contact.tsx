import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Contact() {
  return (
    <div style={{ minHeight: "100vh", background: "#0A1628", color: "#fff" }}>
      <Navbar />
      <section style={{ padding: "96px 2rem", maxWidth: 640, margin: "0 auto" }}>
        <h1 style={{ fontSize: "clamp(2rem,5vw,3.5rem)", fontWeight: 800, marginBottom: 16 }}>Contact Us</h1>
        <p style={{ color: "#8892B0", fontSize: 18, lineHeight: 1.8, marginBottom: 48 }}>
          Have a question or need help? Reach out and our team will get back to you within one business day.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {[
            { label: "Full Name", type: "text", placeholder: "Jane Smith" },
            { label: "Email", type: "email", placeholder: "jane@cpafirm.com" },
          ].map(({ label, type, placeholder }) => (
            <div key={label} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label style={{ fontSize: 14, fontWeight: 500, color: "#ccd6f6" }}>{label}</label>
              <input
                type={type}
                placeholder={placeholder}
                style={{ background: "#112240", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "12px 16px", color: "#fff", fontSize: 15, outline: "none" }}
              />
            </div>
          ))}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <label style={{ fontSize: 14, fontWeight: 500, color: "#ccd6f6" }}>Message</label>
            <textarea
              rows={5}
              placeholder="How can we help?"
              style={{ background: "#112240", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "12px 16px", color: "#fff", fontSize: 15, outline: "none", resize: "vertical" }}
            />
          </div>
          <button
            style={{ background: "#10B981", color: "#0A1628", fontWeight: 700, fontSize: 15, padding: "14px 32px", borderRadius: 10, border: "none", cursor: "pointer", marginTop: 8 }}
          >
            Send Message
          </button>
        </div>
      </section>
      <Footer />
    </div>
  );
}
