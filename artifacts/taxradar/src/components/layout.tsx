import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Radar, ShieldCheck, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/80 backdrop-blur-xl transition-all">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-primary/10 p-2 rounded-xl group-hover:bg-primary/20 transition-colors">
              <Radar className="w-6 h-6 text-primary" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              Tax<span className="text-primary">Radar</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <Link href="/" className="hover:text-white transition-colors">Features</Link>
            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
            <Link href="/upload" className="hover:text-white transition-colors">How It Works</Link>
          </nav>

          <div className="flex items-center gap-4">
            {location !== "/upload" && (
              <Link href="/upload" className="hidden sm:block">
                <Button variant="outline" className="border-primary/20 text-primary hover:bg-primary/10 hover-elevate">
                  Login
                </Button>
              </Link>
            )}
            <Link href="/upload">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 hover-elevate font-semibold px-6 shadow-lg shadow-primary/20">
                Start Free Trial <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="border-t border-white/5 bg-card/30 pt-16 pb-8 mt-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Radar className="w-5 h-5 text-primary" />
                <span className="text-lg font-bold text-white">TaxRadar</span>
              </div>
              <p className="text-muted-foreground max-w-sm mb-6 leading-relaxed">
                Audit-ready in minutes. Built exclusively for tax professionals to accelerate document review and mitigate risk.
              </p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                <ShieldCheck className="w-4 h-4 text-green-500" />
                <span>Bank-grade 256-bit encryption</span>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><Link href="/upload" className="hover:text-primary transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
                <li><Link href="/upload" className="hover:text-primary transition-colors">Security</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><Link href="/upload" className="hover:text-primary transition-colors">About</Link></li>
                <li><Link href="/upload" className="hover:text-primary transition-colors">Contact</Link></li>
                <li><Link href="/upload" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} TaxRadar Inc. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <Link href="/upload" className="hover:text-white transition-colors">Terms of Service</Link>
              <Link href="/upload" className="hover:text-white transition-colors">Privacy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
