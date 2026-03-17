import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const plans = [
  {
    name: "Starter",
    price: "$79",
    period: "per month",
    desc: "Perfect for solo practitioners and small firms.",
    features: ["30 clients/month", "1 User", "PDF export", "Standard support"],
    popular: false,
  },
  {
    name: "Professional",
    price: "$199",
    period: "per month",
    desc: "For growing tax practices that need scale.",
    features: ["150 clients/month", "5 Users", "PDF export", "Priority support", "Custom branding"],
    popular: true,
  },
  {
    name: "Enterprise",
    price: "$599",
    period: "per month",
    desc: "Maximum power for large accounting firms.",
    features: ["Unlimited clients", "Unlimited users", "All exports", "API access", "Dedicated support", "SSO login"],
    popular: false,
  },
];

const faqs = [
  { q: "Is my clients' data secure?", a: "Yes. We use bank-grade 256-bit encryption. Documents are processed in memory and immediately discarded. We do not store client PII after the session ends." },
  { q: "Do you integrate with my tax software?", a: "TaxRadar provides universal PDF and Excel exports compatible with Drake, ProConnect, Lacerte, and other major tax software platforms." },
  { q: "Can I upgrade or downgrade my plan?", a: "You can change your plan at any time. Changes take effect immediately and are prorated for the remainder of your billing cycle." },
];

export default function Pricing() {
  return (
    <div style={{ minHeight: "100vh", background: "#0A1628", color: "#fff" }}>
      <Navbar />

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "96px 2rem" }}>
        <div style={{ textAlign: "center", maxWidth: 640, margin: "0 auto 64px" }}>
          <h1 style={{ fontSize: 48, fontWeight: 800, marginBottom: 20 }}>Simple, transparent pricing</h1>
          <p style={{ color: "#8892B0", fontSize: 18, lineHeight: 1.7 }}>No hidden fees. Choose the plan that best fits your firm's volume. All plans include a 14-day free trial.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 32, maxWidth: 1100, margin: "0 auto 96px", alignItems: "start" }}>
          {plans.map((plan) => (
            <div
              key={plan.name}
              style={{
                background: "#112240",
                borderRadius: 20,
                padding: 36,
                border: plan.popular ? "1px solid #10B981" : "1px solid rgba(255,255,255,0.05)",
                transform: plan.popular ? "translateY(-8px)" : "none",
                boxShadow: plan.popular ? "0 24px 64px hsla(160,84%,39%,0.15)" : "none",
                position: "relative",
              }}
            >
              {plan.popular && (
                <div style={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)", background: "#10B981", color: "#0A1628", fontSize: 11, fontWeight: 800, padding: "4px 20px", borderRadius: 999, letterSpacing: 1, textTransform: "uppercase", whiteSpace: "nowrap" }}>
                  Most Popular
                </div>
              )}
              <h3 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>{plan.name}</h3>
              <p style={{ color: "#8892B0", fontSize: 14, marginBottom: 24, minHeight: 40 }}>{plan.desc}</p>
              <div style={{ marginBottom: 32 }}>
                <span style={{ fontSize: 52, fontWeight: 800 }}>{plan.price}</span>
                <span style={{ color: "#8892B0" }}> {plan.period}</span>
              </div>
              <Link href="/upload">
                <button style={{ width: "100%", padding: "14px 0", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 15, marginBottom: 32, background: plan.popular ? "#10B981" : "rgba(255,255,255,0.1)", color: plan.popular ? "#0A1628" : "#fff" }}>
                  Start Free Trial
                </button>
              </Link>
              <ul style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {plan.features.map((f) => (
                  <li key={f} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14 }}>
                    <span style={{ color: "#10B981", fontWeight: 700 }}>&#10003;</span> {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, textAlign: "center", marginBottom: 48 }}>Frequently Asked Questions</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {faqs.map((faq) => (
              <div key={faq.q} style={{ background: "#112240", borderRadius: 14, padding: 24, border: "1px solid rgba(255,255,255,0.05)" }}>
                <h4 style={{ fontWeight: 700, fontSize: 16, marginBottom: 10 }}>{faq.q}</h4>
                <p style={{ color: "#8892B0", lineHeight: 1.7, fontSize: 14 }}>{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
