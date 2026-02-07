"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="border-b border-orange-100 dark:border-orange-900/30 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="ContextReach"
              width={32}
              height={32}
            />
            <span className="text-xl font-semibold text-slate-900 dark:text-white">
              ContextReach
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/signin">
              <Button variant="ghost">Log in</Button>
            </Link>
            <Link href="/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-32">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 dark:bg-orange-900/30 text-[#ff7032] dark:text-[#ff8c5a] text-sm font-medium mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff7032] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ff7032]"></span>
            </span>
            AI-Powered Outreach
          </div>
          
          <h1 className="text-5xl sm:text-6xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight">
            Find Your Perfect
            <span className="text-[#ff7032] dark:text-[#ff8c5a]"> Prospects</span>
          </h1>
          
          <p className="text-xl text-slate-600 dark:text-slate-400 mb-10 leading-relaxed">
            Describe your solution in plain English and let AI discover, enrich, and 
            qualify your ideal customers. Stop manual prospecting, start closing deals.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="px-8 py-6 text-lg">
                Start Free Discovery
              </Button>
            </Link>
            <Link href="/signin">
              <Button size="lg" variant="outline" className="px-8 py-6 text-lg">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-orange-50/50 dark:bg-slate-900 py-24 border-y border-orange-100 dark:border-orange-900/30">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-4">
            How It Works
          </h2>
          <p className="text-center text-slate-600 dark:text-slate-400 mb-16 max-w-2xl mx-auto">
            Three simple steps to find your next customers
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center p-6">
              <div className="w-16 h-16 rounded-2xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">✍️</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                1. Describe Your Solution
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Tell us what you sell in plain English. Our AI understands your value proposition 
                and identifies who needs it most.
              </p>
            </div>
            
            {/* Step 2 */}
            <div className="text-center p-6">
              <div className="w-16 h-16 rounded-2xl bg-[#ffc3a6] dark:bg-orange-900/30 flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">🔍</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                2. AI Discovers Contacts
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Our AI searches across databases to find decision-makers who match your 
                ideal customer profile with verified contact info.
              </p>
            </div>
            
            {/* Step 3 */}
            <div className="text-center p-6">
              <div className="w-16 h-16 rounded-2xl bg-[#ffdfcc] dark:bg-orange-900/30 flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">🚀</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                3. Start Reaching Out
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Get enriched contacts with emails, LinkedIn profiles, and company data. 
                Ready to import into your CRM or outreach tool.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-16">
            Why Choose ContextReach?
          </h2>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-orange-100 dark:border-orange-900/30">
              <div className="text-2xl mb-3">🎯</div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">AI Targeting</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Natural language understanding identifies your ideal customer profile automatically.
              </p>
            </div>
            
            <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-orange-100 dark:border-orange-900/30">
              <div className="text-2xl mb-3">✅</div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Verified Emails</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Every contact comes with verified email addresses and confidence scores.
              </p>
            </div>
            
            <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-orange-100 dark:border-orange-900/30">
              <div className="text-2xl mb-3">⚡</div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Fast Results</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Get qualified leads in minutes, not days. Stop wasting time on research.
              </p>
            </div>
            
            <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-orange-100 dark:border-orange-900/30">
              <div className="text-2xl mb-3">📊</div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Rich Data</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Get company size, industry, title, and LinkedIn profiles for every contact.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-[#ff7032] to-[#ff8c5a]">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Find Your Next Customers?
          </h2>
          <p className="text-white/80 mb-8">
            Join hundreds of sales teams using ContextReach to discover qualified prospects.
          </p>
          <Link href="/signup">
            <Button size="lg" className="px-8 py-6 text-lg bg-white text-[#ff7032] hover:bg-slate-100">
              Get Started Free
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-orange-100 dark:border-orange-900/30 bg-white dark:bg-slate-900">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="ContextReach"
                width={32}
                height={32}
              />
              <span className="text-lg font-semibold text-slate-900 dark:text-white">
                ContextReach
              </span>
            </div>
            
            <div className="flex items-center gap-8 text-sm">
              <Link href="/privacy" className="text-slate-500 hover:text-[#ff7032] dark:hover:text-[#ff8c5a] transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-slate-500 hover:text-[#ff7032] dark:hover:text-[#ff8c5a] transition-colors">
                Terms of Use
              </Link>
              <Link href="/signin" className="text-slate-500 hover:text-[#ff7032] dark:hover:text-[#ff8c5a] transition-colors">
                Sign In
              </Link>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-orange-100 dark:border-orange-900/30 text-center text-sm text-slate-500">
            © 2026 ContextReach. AI-powered prospect discovery. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
