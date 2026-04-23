"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ToolSearch } from "@/components/tool-search";
import { categoryLabels, categoryOrder } from "@/lib/tools";

function navClassName(active: boolean): string {
  return active
    ? "text-brand"
    : "text-muted transition hover:text-brand";
}

function chipClassName(active: boolean): string {
  return active
    ? "rounded-full border border-brand bg-brand/10 px-3 py-1.5 text-xs font-semibold text-brand"
    : "rounded-full border border-line bg-white px-3 py-1.5 text-xs font-semibold text-muted";
}

export function SiteNav() {
  const pathname = usePathname();
  const isToolsActive = pathname === "/tools" || pathname.startsWith("/tools/");
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 border-b border-line/80 bg-surface/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="inline-flex items-center gap-2 text-lg font-bold tracking-tight text-foreground">
          <Image
            src="/usefulkit-logo.svg"
            alt="UsefulKit logo"
            width={28}
            height={28}
            className="h-7 w-7"
            priority
          />
          <span>UsefulKit</span>
        </Link>
        <nav className="hidden items-center gap-5 text-sm font-semibold md:flex">
          <Link href="/tools" className={navClassName(isToolsActive)}>
            All Tools
          </Link>
          {categoryOrder.map((category) => {
            const href = `/categories/${category}`;
            const isActive = pathname === href;
            return (
              <Link key={category} href={href} className={navClassName(isActive)}>
                {categoryLabels[category]}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => setSearchOpen((v) => !v)}
            aria-label="Toggle search"
            className={`rounded-full border p-2 transition ${
              searchOpen
                ? "border-brand bg-brand/10 text-brand"
                : "border-line text-muted hover:border-brand hover:text-brand"
            }`}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20L17 17" />
            </svg>
          </button>
        </nav>
      </div>
      {searchOpen ? (
        <div className="mx-auto w-full max-w-6xl px-4 pb-3 sm:px-6 lg:px-8">
          <ToolSearch autoFocus onSelect={() => setSearchOpen(false)} />
        </div>
      ) : null}
      <div className="mx-auto w-full max-w-6xl px-4 pb-3 sm:px-6 md:hidden lg:px-8">
        <nav className="flex gap-2 overflow-x-auto whitespace-nowrap">
          <Link href="/tools" className={chipClassName(isToolsActive)}>
            All Tools
          </Link>
          {categoryOrder.map((category) => {
            const href = `/categories/${category}`;
            const isActive = pathname === href;
            return (
              <Link key={category} href={href} className={chipClassName(isActive)}>
                {categoryLabels[category]}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => setSearchOpen((v) => !v)}
            aria-label="Toggle search"
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
              searchOpen
                ? "border-brand bg-brand/10 text-brand"
                : "border-line bg-white text-muted"
            }`}
          >
            Search
          </button>
        </nav>
      </div>
    </header>
  );
}
