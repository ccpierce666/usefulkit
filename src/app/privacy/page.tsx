import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy policy for UsefulKit tools and website usage.",
  alternates: {
    canonical: "https://usefulkit.io/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="rounded-3xl border border-line bg-surface p-6 shadow-sm sm:p-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Privacy Policy</h1>
        <p className="mt-3 text-sm text-muted">Last updated: April 23, 2026</p>
      </header>

      <section className="mt-6 rounded-3xl border border-line bg-surface p-6 text-sm leading-7 text-foreground shadow-sm">
        <p>
          UsefulKit is designed to process most tool inputs in your browser. For tools that run
          client-side, files and text are not uploaded to our servers.
        </p>
        <p className="mt-3">
          We may collect standard analytics data such as page views, browser type, and referral
          source to improve product quality and performance.
        </p>
        <p className="mt-3">
          If you contact us directly, we may store the information you provide for support and
          operational communication.
        </p>
        <p className="mt-3">
          We may update this policy as the product evolves. Continued use of UsefulKit indicates
          acceptance of the current version.
        </p>
      </section>
    </main>
  );
}
