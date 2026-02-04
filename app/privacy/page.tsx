"use client";

import Link from "next/link";

export default function PrivacyPage() {
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
          Privacy Policy
        </h1>
        
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <p className="text-slate-600 dark:text-slate-400 text-lg mb-8">
            Last updated: February 2026
          </p>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
              1. Introduction
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              ContextReach (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your 
              information when you use our AI-powered outreach platform.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
              2. Information We Collect
            </h2>
            <h3 className="text-xl font-medium text-slate-800 dark:text-slate-200 mb-3">
              2.1 Personal Information
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              When you create an account, we collect:
            </p>
            <ul className="list-disc pl-6 text-slate-600 dark:text-slate-400 mb-4 space-y-2">
              <li>Name and email address</li>
              <li>Company name and job title</li>
              <li>Password (encrypted)</li>
              <li>Payment information (processed by our payment provider)</li>
            </ul>

            <h3 className="text-xl font-medium text-slate-800 dark:text-slate-200 mb-3">
              2.2 Usage Information
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              We automatically collect:
            </p>
            <ul className="list-disc pl-6 text-slate-600 dark:text-slate-400 mb-4 space-y-2">
              <li>Log data (IP address, browser type, pages visited)</li>
              <li>Device information</li>
              <li>Usage patterns and feature interactions</li>
            </ul>

            <h3 className="text-xl font-medium text-slate-800 dark:text-slate-200 mb-3">
              2.3 Third-Party Data
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              When you connect your Gmail account, we request only the permissions necessary 
              to send emails on your behalf. We do not read, store, or access your inbox contents.
            </p>
          </section>

          {/* Google API Services Disclosure - Required for Gmail Restricted Scope */}
          <section className="mb-12 p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
              Google API Services User Data Policy
            </h2>
            
            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg mb-6 border border-blue-200 dark:border-blue-700">
              <p className="text-slate-700 dark:text-slate-300 font-medium">
                ContextReach AI&apos;s use and transfer to any other app of information received from 
                Google APIs will adhere to{" "}
                <a 
                  href="https://developers.google.com/terms/api-services-user-data-policy" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 underline hover:text-blue-700"
                >
                  Google API Services User Data Policy
                </a>
                , including the Limited Use requirements.
              </p>
            </div>

            <h3 className="text-xl font-medium text-slate-800 dark:text-slate-200 mb-3">
              Data Collection via Google OAuth
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              We collect your email address and name via Google OAuth to create your account 
              and identify your outreach campaigns.
            </p>

            <h3 className="text-xl font-medium text-slate-800 dark:text-slate-200 mb-3">
              Gmail Data Usage
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              We use your Gmail access solely to send outreach emails you have drafted and to 
              track replies to those emails. We do not use your data for advertising or sell 
              it to third parties.
            </p>

            <h3 className="text-xl font-medium text-slate-800 dark:text-slate-200 mb-3">
              Data Storage
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              All email data is encrypted at rest. We only store metadata (timestamps, recipient 
              addresses) necessary for campaign analytics. We do not store the content of emails 
              in your inbox. <strong>We only access email metadata (headers) to track outreach 
              success and never read the content of your messages.</strong>
            </p>

            <h3 className="text-xl font-medium text-slate-800 dark:text-slate-200 mb-3">
              Human Access to Data
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              No human at ContextReach AI reads your emails unless you explicitly provide us 
              with a specific email for troubleshooting support. Access to any user data is 
              strictly limited and logged.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
              3. How We Use Your Information
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-6 text-slate-600 dark:text-slate-400 mb-4 space-y-2">
              <li>Provide and maintain our services</li>
              <li>Process your discovery campaigns and outreach</li>
              <li>Send transactional emails and service updates</li>
              <li>Improve our AI models and user experience</li>
              <li>Detect and prevent fraud or abuse</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
              4. Data Sharing and Disclosure
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              We do not sell your personal information. We may share data with:
            </p>
            <ul className="list-disc pl-6 text-slate-600 dark:text-slate-400 mb-4 space-y-2">
              <li>Service providers who assist in operating our platform</li>
              <li>Professional advisors (lawyers, accountants)</li>
              <li>Law enforcement when required by law</li>
              <li>Business partners with your consent</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
              5. Data Security
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              We implement appropriate technical and organizational measures to protect your 
              data, including encryption in transit and at rest, access controls, and regular 
              security assessments.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
              6. Your Rights
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              You have the right to:
            </p>
            <ul className="list-disc pl-6 text-slate-600 dark:text-slate-400 mb-4 space-y-2">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Delete your account and data</li>
              <li>Export your data</li>
              <li>Opt-out of marketing communications</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
              7. Cookies
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              We use essential cookies to maintain your session and preferences. We may use 
              analytics cookies to understand how you use our service. You can control cookies 
              through your browser settings.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
              8. Changes to This Policy
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              We may update this Privacy Policy from time to time. We will notify you of any 
              changes by posting the new policy on this page and updating the &quot;Last updated&quot; date.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
              9. Contact Us
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              If you have questions about this Privacy Policy, please contact us at:
            </p>
            <p className="text-slate-600 dark:text-slate-400">
              Email: privacy@contextreach.ai
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
