"use client";

import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 dark:bg-white">
              <span className="text-sm font-bold text-white dark:text-slate-900">CR</span>
            </div>
            <span className="text-xl font-semibold text-slate-900 dark:text-white">
              ContextReach
            </span>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-8">
          Terms of Use
        </h1>
        
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <p className="text-slate-600 dark:text-slate-400 text-lg mb-8">
            Last updated: February 2026
          </p>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
              1. Acceptance of Terms
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              By accessing or using ContextReach (&quot;Service&quot;), you agree to be bound by these 
              Terms of Use (&quot;Terms&quot;). If you do not agree to these Terms, do not use the Service.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
              2. Description of Service
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              ContextReach is an AI-powered platform that helps businesses discover and reach 
              potential customers. Our services include:
            </p>
            <ul className="list-disc pl-6 text-slate-600 dark:text-slate-400 mb-4 space-y-2">
              <li>AI-powered prospect discovery based on your solution description</li>
              <li>Contact enrichment with verified email addresses</li>
              <li>Automated email outreach campaigns</li>
              <li>Campaign analytics and tracking</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
              3. Account Registration
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              To use certain features, you must create an account. You agree to:
            </p>
            <ul className="list-disc pl-6 text-slate-600 dark:text-slate-400 mb-4 space-y-2">
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Notify us immediately of any unauthorized access</li>
              <li>Be responsible for all activities under your account</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
              4. Acceptable Use
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              You agree NOT to use the Service to:
            </p>
            <ul className="list-disc pl-6 text-slate-600 dark:text-slate-400 mb-4 space-y-2">
              <li>Send spam or unsolicited bulk emails</li>
              <li>Violate any applicable laws or regulations (including CAN-SPAM, GDPR)</li>
              <li>Harass, abuse, or harm others</li>
              <li>Infringe on intellectual property rights</li>
              <li>Transmit malware or malicious code</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Scrape or harvest data beyond permitted API usage</li>
              <li>Resell or redistribute our services without permission</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
              5. Email Compliance
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              When using our email outreach features, you must:
            </p>
            <ul className="list-disc pl-6 text-slate-600 dark:text-slate-400 mb-4 space-y-2">
              <li>Comply with all applicable anti-spam laws</li>
              <li>Include accurate sender information</li>
              <li>Provide a clear unsubscribe mechanism</li>
              <li>Honor opt-out requests promptly</li>
              <li>Not use deceptive subject lines or content</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
              6. Credits and Billing
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Our Service operates on a credit-based system. You agree that:
            </p>
            <ul className="list-disc pl-6 text-slate-600 dark:text-slate-400 mb-4 space-y-2">
              <li>Credits are consumed when using discovery and outreach features</li>
              <li>Unused credits may expire according to your plan terms</li>
              <li>Credits are non-refundable except as required by law</li>
              <li>We may modify pricing with reasonable notice</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
              7. Intellectual Property
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              The Service and its original content, features, and functionality are owned by 
              ContextReach and are protected by international copyright, trademark, and other 
              intellectual property laws.
            </p>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              You retain ownership of any content you upload or create using our Service.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
              8. Data and Privacy
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Your use of the Service is also governed by our{" "}
              <Link href="/privacy" className="text-blue-600 dark:text-blue-400 hover:underline">
                Privacy Policy
              </Link>
              . By using the Service, you consent to our data practices.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
              9. Disclaimers
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND. 
              WE DO NOT GUARANTEE:
            </p>
            <ul className="list-disc pl-6 text-slate-600 dark:text-slate-400 mb-4 space-y-2">
              <li>The accuracy or completeness of contact data</li>
              <li>Email deliverability or response rates</li>
              <li>Uninterrupted or error-free service</li>
              <li>That the Service will meet your specific requirements</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
              10. Limitation of Liability
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, CONTEXTREACH SHALL NOT BE LIABLE FOR ANY 
              INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS 
              OF PROFITS, DATA, OR BUSINESS OPPORTUNITIES.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
              11. Indemnification
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              You agree to indemnify and hold harmless ContextReach and its officers, directors, 
              employees, and agents from any claims, damages, or expenses arising from your use 
              of the Service or violation of these Terms.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
              12. Termination
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              We may terminate or suspend your account at any time for violations of these Terms. 
              Upon termination, your right to use the Service will cease immediately.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
              13. Changes to Terms
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              We reserve the right to modify these Terms at any time. We will provide notice of 
              significant changes. Your continued use of the Service after changes constitutes 
              acceptance of the new Terms.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
              14. Governing Law
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              These Terms shall be governed by and construed in accordance with the laws of the 
              State of Delaware, United States, without regard to its conflict of law provisions.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
              15. Contact Us
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              If you have questions about these Terms, please contact us at:
            </p>
            <p className="text-slate-600 dark:text-slate-400">
              Email: legal@contextreach.ai
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-slate-500">
            © 2026 ContextReach. All rights reserved.
          </div>
          <div className="flex items-center gap-6 text-sm">
            <Link href="/terms" className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
              Terms of Use
            </Link>
            <Link href="/privacy" className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
              Privacy Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
