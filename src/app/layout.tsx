import type { Metadata } from "next";
import Link from "next/link";
import { Analytics } from "@/components/analytics";
import { SiteNav } from "@/components/site-nav";
import "./globals.css";

const googleSiteVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;

export const metadata: Metadata = {
  metadataBase: new URL("https://usefulkit.io"),
  applicationName: "UsefulKit",
  title: {
    default: "UsefulKit - Free Online Tools That Just Work",
    template: "%s | UsefulKit",
  },
  description:
    "UsefulKit offers fast, free, privacy-friendly tools for files, text, dates, converters, and health calculations.",
  keywords: [
    "free online tools",
    "calculator tools",
    "file converter tools",
    "text utilities",
    "usefulkit",
  ],
  openGraph: {
    title: "UsefulKit",
    description:
      "Free online tools for everyday tasks. Fast, accurate, and built for mobile.",
    url: "https://usefulkit.io",
    siteName: "UsefulKit",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image",
        width: 1200,
        height: 630,
        alt: "UsefulKit free online tools",
      },
    ],
  },
  alternates: {
    canonical: "https://usefulkit.io",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  twitter: {
    card: "summary_large_image",
    title: "UsefulKit",
    description:
      "Free online tools for everyday tasks. Fast, accurate, and built for mobile.",
    images: ["/twitter-image"],
  },
  verification: googleSiteVerification ? { google: googleSiteVerification } : undefined,
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <SiteNav />

        <div className="flex-1">{children}</div>

        <footer className="border-t border-line bg-surface">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-muted sm:px-6 lg:px-8">
            <p className="font-semibold text-foreground">UsefulKit</p>
            <p>Free online tools for files, text, dates, converters, and health.</p>
            <nav className="mt-1 flex flex-wrap gap-3 text-xs">
              <Link href="/privacy" className="transition hover:text-brand">
                Privacy Policy
              </Link>
              <Link href="/terms" className="transition hover:text-brand">
                Terms
              </Link>
              <Link href="/contact" className="transition hover:text-brand">
                Contact
              </Link>
            </nav>
          </div>
        </footer>
        <Analytics />
      </body>
    </html>
  );
}
