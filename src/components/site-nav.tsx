"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ToolSearch } from "@/components/tool-search";

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

const robloxLookupPaths = [
  "/tools/roblox-player-lookup",
  "/tools/roblox-username-to-id",
  "/tools/roblox-user-id-lookup",
  "/tools/roblox-avatar-lookup",
];

export function SiteNav() {
  const pathname = usePathname();
  const isRobloxLookupActive = robloxLookupPaths.some((href) => pathname === href);
  const isRobloxExperienceActive = pathname === "/tools/roblox-game-lookup";
  const isRobloxGroupActive =
    pathname === "/tools/roblox-group-lookup" || pathname === "/tools/roblox-user-groups-lookup";
  const isRobloxBadgeActive = pathname === "/tools/roblox-badge-lookup";
  const isRobloxToolActive =
    isRobloxLookupActive || isRobloxExperienceActive || isRobloxGroupActive || isRobloxBadgeActive;
  const isToolsActive =
    pathname === "/tools" ||
    pathname.startsWith("/categories/") ||
    (pathname.startsWith("/tools/") && !isRobloxToolActive);
  const isRobloxActive = pathname === "/roblox" || pathname.startsWith("/roblox/");
  const navItems = [
    { href: "/roblox", label: "Roblox", active: isRobloxActive && pathname !== "/roblox/games" && !pathname.startsWith("/roblox/games/") },
    { href: "/roblox/games", label: "Games", active: pathname === "/roblox/games" || pathname.startsWith("/roblox/games/") },
    { href: "/tools/roblox-player-lookup", label: "Player Lookup", active: isRobloxLookupActive },
    { href: "/tools/roblox-game-lookup", label: "Experience Lookup", active: isRobloxExperienceActive },
    { href: "/tools/roblox-group-lookup", label: "Groups", active: isRobloxGroupActive },
    { href: "/tools/roblox-badge-lookup", label: "Badges", active: isRobloxBadgeActive },
    { href: "/tools", label: "All Tools", active: isToolsActive },
  ];
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
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className={navClassName(item.active)}>
              {item.label}
            </Link>
          ))}
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
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className={chipClassName(item.active)}>
              {item.label}
            </Link>
          ))}
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
