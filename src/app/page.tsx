import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-sm">
              CV
            </div>
            <span className="text-xl font-bold text-gray-900">COI Vault</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/auth/signin"
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 py-24 text-center">
        <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
          Stop tracking vendor COIs
          <br />
          <span className="text-blue-600">in spreadsheets.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
          Track vendor certificates of insurance, expirations, and compliance in
          one place — with automated reminders and audit logs. Built for
          property managers, condo boards, and general contractors.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link
            href="/auth/signup"
            className="rounded-lg bg-blue-600 px-8 py-3 text-base font-medium text-white hover:bg-blue-700"
          >
            Start Free — No Credit Card
          </Link>
          <a
            href="#pricing"
            className="rounded-lg border border-gray-300 px-8 py-3 text-base font-medium text-gray-700 hover:bg-gray-50"
          >
            View Pricing
          </a>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-gray-100 bg-gray-50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-3xl font-bold text-gray-900">
            Everything you need to stay compliant
          </h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              {
                title: "Vendor Management",
                desc: "Add vendors, track their contact info, and organize all their documents in one place.",
                icon: "📋",
              },
              {
                title: "Expiry Tracking",
                desc: "See at a glance which COIs are expiring soon — 7, 14, or 30 days out. Never miss a renewal.",
                icon: "⏰",
              },
              {
                title: "Automated Reminders",
                desc: "Get email reminders when vendor documents are about to expire. Set it and forget it.",
                icon: "📧",
              },
              {
                title: "Audit Logs",
                desc: "Every action tracked — vendor created, document added, subscription changed. Full accountability.",
                icon: "📝",
              },
              {
                title: "Team Access",
                desc: "Invite your team with role-based access. Owners, admins, and members — each with appropriate permissions.",
                icon: "👥",
              },
              {
                title: "Secure & Scalable",
                desc: "Your data is safe. Built with modern security practices, encrypted at rest, and backed up daily.",
                icon: "🔒",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-gray-200 bg-white p-6"
              >
                <div className="text-3xl">{feature.icon}</div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-3xl font-bold text-gray-900">
            Simple, transparent pricing
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-gray-600">
            Start free. Upgrade when you need more.
          </p>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {/* Free */}
            <div className="rounded-xl border border-gray-200 p-8">
              <h3 className="text-lg font-semibold text-gray-900">Free</h3>
              <p className="mt-2 text-4xl font-bold text-gray-900">$0</p>
              <p className="text-sm text-gray-500">/month</p>
              <ul className="mt-6 space-y-3 text-sm text-gray-600">
                <li>✓ Up to 5 vendors</li>
                <li>✓ Up to 10 documents</li>
                <li>✓ 1 team seat</li>
                <li>✓ Email reminders</li>
                <li>✓ Audit logs</li>
              </ul>
              <Link
                href="/auth/signup"
                className="mt-8 block rounded-lg border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Get Started
              </Link>
            </div>

            {/* Pro */}
            <div className="rounded-xl border-2 border-blue-600 p-8 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-3 py-1 text-xs font-medium text-white">
                Most Popular
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Pro</h3>
              <p className="mt-2 text-4xl font-bold text-gray-900">$29</p>
              <p className="text-sm text-gray-500">/month</p>
              <ul className="mt-6 space-y-3 text-sm text-gray-600">
                <li>✓ Unlimited vendors</li>
                <li>✓ Unlimited documents</li>
                <li>✓ 1 team seat</li>
                <li>✓ Priority email reminders</li>
                <li>✓ Full audit logs</li>
              </ul>
              <Link
                href="/auth/signup"
                className="mt-8 block rounded-lg bg-blue-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-blue-700"
              >
                Start Free Trial
              </Link>
            </div>

            {/* Team */}
            <div className="rounded-xl border border-gray-200 p-8">
              <h3 className="text-lg font-semibold text-gray-900">Team</h3>
              <p className="mt-2 text-4xl font-bold text-gray-900">$79</p>
              <p className="text-sm text-gray-500">/month</p>
              <ul className="mt-6 space-y-3 text-sm text-gray-600">
                <li>✓ Unlimited vendors</li>
                <li>✓ Unlimited documents</li>
                <li>✓ Up to 10 team seats</li>
                <li>✓ Priority email reminders</li>
                <li>✓ Full audit logs</li>
              </ul>
              <Link
                href="/auth/signup"
                className="mt-8 block rounded-lg border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-gray-50 py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-blue-600 text-white text-xs font-bold">
                CV
              </div>
              <span className="font-semibold text-gray-900">COI Vault</span>
            </div>
            <p className="max-w-md text-sm text-gray-500">
              COI Vault is a document tracking and workflow tool. It does not
              provide insurance, legal, or compliance advice. Always consult
              with qualified professionals for insurance and legal matters.
            </p>
            <p className="text-xs text-gray-400">
              © {new Date().getFullYear()} COI Vault. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
