import { Layout } from "@/components/layout";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { clsx } from "clsx";
import { Link } from "wouter";

export default function PricingPage() {
  const plans = [
    {
      name: "Starter",
      price: "$79",
      period: "per month",
      desc: "Perfect for solo practitioners and small firms.",
      features: [
        "Up to 30 clients/year",
        "1 User Account",
        "PDF Report Exports",
        "Standard Email Support",
        "Basic Deduction Checks"
      ],
      notIncluded: [
        "API Access",
        "Custom Branding",
        "Priority Support"
      ]
    },
    {
      name: "Professional",
      price: "$199",
      period: "per month",
      desc: "For growing tax practices that need scale.",
      popular: true,
      features: [
        "Up to 150 clients/year",
        "5 User Accounts",
        "PDF & Excel Exports",
        "Priority Email & Chat Support",
        "Advanced Deduction Checks",
        "Custom Branding (Logo)"
      ],
      notIncluded: [
        "API Access"
      ]
    },
    {
      name: "Enterprise",
      price: "$599",
      period: "per month",
      desc: "Maximum power for large accounting firms.",
      features: [
        "Unlimited clients",
        "Unlimited User Accounts",
        "All Export Formats",
        "Dedicated Account Manager",
        "Full Audit Risk Modeling",
        "Custom Branding",
        "Full API Access",
        "SSO / SAML Login"
      ],
      notIncluded: []
    }
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Simple, transparent pricing</h1>
          <p className="text-xl text-muted-foreground">
            No hidden fees. Choose the plan that best fits your firm's volume. All plans include a 14-day free trial.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, i) => (
            <Card 
              key={i} 
              className={clsx(
                "relative p-8 flex flex-col bg-card border transition-all duration-300",
                plan.popular ? "border-primary shadow-xl shadow-primary/10 -translate-y-2" : "border-white/5 hover:border-white/20"
              )}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider py-1 px-4 rounded-full">
                  Most Popular
                </div>
              )}
              
              <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
              <p className="text-muted-foreground text-sm mb-6 h-10">{plan.desc}</p>
              
              <div className="mb-8">
                <span className="text-5xl font-bold text-white">{plan.price}</span>
                <span className="text-muted-foreground"> {plan.period}</span>
              </div>
              
              <Link href="/upload" className="mb-8 w-full block">
                <Button 
                  className={clsx("w-full h-12 font-semibold", plan.popular ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-white/10 text-white hover:bg-white/20")}
                >
                  Start Free Trial
                </Button>
              </Link>
              
              <div className="space-y-4 flex-1">
                {plan.features.map((feature, j) => (
                  <div key={j} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary shrink-0" />
                    <span className="text-sm text-white">{feature}</span>
                  </div>
                ))}
                {plan.notIncluded.map((feature, j) => (
                  <div key={j} className="flex items-start gap-3 opacity-50">
                    <X className="w-5 h-5 text-muted-foreground shrink-0" />
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-32 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {[
              { q: "Is my clients' data secure?", a: "Yes. We use bank-grade 256-bit encryption. Documents are processed in memory and immediately discarded. We do not store client PII after the session ends." },
              { q: "Do you integrate with my tax software?", a: "TaxRadar provides universal PDF and Excel exports that can be imported into Drake, ProConnect, Lacerte, and other major tax software platforms." },
              { q: "Can I upgrade or downgrade my plan?", a: "Absolutely. You can change your plan at any time. Changes take effect immediately and are prorated for the remainder of your billing cycle." }
            ].map((faq, i) => (
              <Card key={i} className="p-6 bg-card border-white/5">
                <h4 className="text-lg font-semibold text-white mb-2">{faq.q}</h4>
                <p className="text-muted-foreground">{faq.a}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
