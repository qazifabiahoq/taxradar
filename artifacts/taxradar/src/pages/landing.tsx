import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, FileCheck, Search, ShieldAlert, FileText, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Layout } from "@/components/layout";

export default function LandingPage() {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" }
  };

  const stagger = {
    animate: { transition: { staggerChildren: 0.1 } }
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative pt-24 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/hero-bg.png')] bg-cover bg-center opacity-30 mix-blend-screen pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background pointer-events-none"></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center max-w-5xl">
          <motion.div initial="initial" animate="animate" variants={stagger}>
            <motion.div variants={fadeIn} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              Tax Season 2024 Readiness Updated
            </motion.div>
            
            <motion.h1 variants={fadeIn} className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6 leading-[1.1]">
              Tax Document Intelligence <br/>
              <span className="text-gradient-gold">in Minutes.</span>
            </motion.h1>
            
            <motion.p variants={fadeIn} className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              Upload client tax documents and instantly generate CPA-ready review memos, flag audit risks, and cross-check income sources. Built exclusively for tax professionals.
            </motion.p>
            
            <motion.div variants={fadeIn} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/upload">
                <Button size="lg" className="w-full sm:w-auto text-lg h-14 px-8 bg-primary text-primary-foreground hover:bg-primary/90 hover:-translate-y-0.5 transition-all shadow-xl shadow-primary/20">
                  Start Free Trial <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/upload">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg h-14 px-8 border-white/20 hover:bg-white/5 hover:-translate-y-0.5 transition-all">
                  See How It Works
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-white/5 bg-card/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-white/5">
            <div className="pt-4 md:pt-0">
              <div className="text-4xl font-bold text-white mb-2">10x</div>
              <div className="text-muted-foreground font-medium">Faster Document Review</div>
            </div>
            <div className="pt-8 md:pt-0">
              <div className="text-4xl font-bold text-white mb-2">12</div>
              <div className="text-muted-foreground font-medium">Risk Categories Checked</div>
            </div>
            <div className="pt-8 md:pt-0">
              <div className="text-4xl font-bold text-white mb-2">2 Min</div>
              <div className="text-muted-foreground font-medium">To Generate CPA Memos</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Enterprise-Grade Analysis</h2>
            <p className="text-lg text-muted-foreground">Stop hunting for missing 1099s. Our AI extracts, classifies, and cross-checks every document against IRS guidelines.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { icon: FileCheck, title: "Document Classification", desc: "Automatically identifies W-2s, 1099s, K-1s, and supporting documents without manual sorting." },
              { icon: Search, title: "Income Cross-Check", desc: "Reconciles reported income across different forms to ensure no discrepancies trigger an audit." },
              { icon: ShieldAlert, title: "Deduction Risk Scoring", desc: "Flags aggressive deductions like home office or vehicle use that exceed industry standard benchmarks." },
              { icon: FileText, title: "Missing Document Detection", desc: "Identifies required but missing documentation based on claimed deductions and income sources." }
            ].map((feature, i) => (
              <Card key={i} className="p-8 bg-card border-white/5 hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 group">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 bg-card/40 border-y border-white/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground">Three simple steps to an audit-ready tax file.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-12 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-primary/10 via-primary/40 to-primary/10"></div>
            
            {[
              { step: "01", title: "Upload Documents", desc: "Drag and drop standard tax documents, PDFs, and images into the secure portal." },
              { step: "02", title: "AI Agents Analyze", desc: "Our engine reads line items, cross-checks amounts, and calculates audit risk scores." },
              { step: "03", title: "Get CPA Memo", desc: "Receive a professional, structured memo detailing red flags and missing items." }
            ].map((item, i) => (
              <div key={i} className="relative z-10 flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-background border-4 border-card flex items-center justify-center text-2xl font-bold text-primary shadow-xl mb-6">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Teaser */}
      <section className="py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to accelerate your firm?</h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
            Join hundreds of CPAs using TaxRadar to cut review time by 90%.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/upload">
              <Button size="lg" className="h-14 px-8 bg-primary text-primary-foreground hover:bg-primary/90 hover-elevate font-semibold">
                Start Your Free Trial
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="ghost" className="h-14 px-8 text-white hover:bg-white/5">
                View Pricing <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
          <div className="mt-8 flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> No credit card required</div>
            <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> 14-day free trial</div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
