import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact UsefulKit for feedback, support, and partnership inquiries.",
  alternates: {
    canonical: "https://usefulkit.io/contact",
  },
};

export default function ContactPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="rounded-3xl border border-line bg-surface p-6 shadow-sm sm:p-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Contact</h1>
        <p className="mt-3 text-base text-muted">
          For support and business inquiries, email us and include the tool name and browser
          details.
        </p>
      </header>

      <section className="mt-6 rounded-3xl border border-line bg-surface p-6 text-sm leading-7 text-foreground shadow-sm">
        <p>
          Support Email: <a className="font-semibold text-brand hover:underline" href="mailto:hello@usefulkit.io">hello@usefulkit.io</a>
        </p>
        <p className="mt-3">
          Typical response time: within 1-2 business days.
        </p>
      </section>
    </main>
  );
}
