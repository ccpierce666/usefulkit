import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Terms of use for UsefulKit online tools.",
  alternates: {
    canonical: "https://usefulkit.io/terms",
  },
};

export default function TermsPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="rounded-3xl border border-line bg-surface p-6 shadow-sm sm:p-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Terms of Use</h1>
        <p className="mt-3 text-sm text-muted">Last updated: April 23, 2026</p>
      </header>

      <section className="mt-6 rounded-3xl border border-line bg-surface p-6 text-sm leading-7 text-foreground shadow-sm">
        <p>
          UsefulKit provides free web tools for informational and productivity purposes. Results
          are provided as-is without warranties of any kind.
        </p>
        <p className="mt-3">
          You are responsible for verifying outputs before using them in legal, financial,
          medical, or business-critical decisions.
        </p>
        <p className="mt-3">
          You agree not to misuse the service, interfere with site stability, or use automated
          traffic patterns that damage service availability.
        </p>
        <p className="mt-3">
          We may update, suspend, or discontinue parts of the service at any time. Continued use
          indicates acceptance of the latest terms.
        </p>
      </section>
    </main>
  );
}
