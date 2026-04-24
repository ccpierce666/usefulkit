"use client";

import { useMemo, useState } from "react";

type LookupLink = {
  name: string;
  desc: string;
  href: string;
  category: "official" | "commercial" | "reputation";
};

function normalizeDomain(input: string): string {
  const cleaned = input.trim().toLowerCase();
  if (!cleaned) return "";
  return cleaned.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];
}

function buildLinks(companyName: string, domain: string): LookupLink[] {
  const q = encodeURIComponent(companyName.trim());
  const domainQ = encodeURIComponent(domain);
  const fallbackQ = encodeURIComponent(`${companyName} ${domain}`.trim());

  return [
    {
      name: "SEC EDGAR (US Public Filings)",
      desc: "Official US public-company filings and disclosure records.",
      href: `https://www.sec.gov/edgar/search/#/q=${q}`,
      category: "official",
    },
    {
      name: "OpenCorporates",
      desc: "Global corporate registry index across many jurisdictions.",
      href: `https://opencorporates.com/companies?utf8=%E2%9C%93&q=${q}&commit=Go`,
      category: "official",
    },
    {
      name: "UK Companies House",
      desc: "Official UK company register and filing history.",
      href: `https://find-and-update.company-information.service.gov.uk/search/companies?q=${q}`,
      category: "official",
    },
    {
      name: "Dun & Bradstreet",
      desc: "Commercial business profile and firmographic data.",
      href: `https://www.dnb.com/business-directory.html?term=${q}`,
      category: "commercial",
    },
    {
      name: "Crunchbase",
      desc: "Company profile, funding history, and ecosystem connections.",
      href: `https://www.crunchbase.com/discover/organization.companies/field/organizations/num_funding_rounds/${q}`,
      category: "commercial",
    },
    {
      name: "LinkedIn Company Search",
      desc: "Team size, activity, and brand presence signals.",
      href: `https://www.linkedin.com/search/results/companies/?keywords=${q}`,
      category: "commercial",
    },
    {
      name: "Google Maps",
      desc: "Local listings, operating info, and map-based identity checks.",
      href: `https://www.google.com/maps/search/${fallbackQ}`,
      category: "reputation",
    },
    {
      name: "Better Business Bureau (BBB)",
      desc: "US business profile, customer complaints, and accreditation.",
      href: `https://www.bbb.org/search?find_text=${q}&find_country=USA`,
      category: "reputation",
    },
    {
      name: "WHOIS Domain Lookup",
      desc: "Registrant and domain registration timeline context.",
      href: domain
        ? `https://www.whois.com/whois/${domainQ}`
        : `https://www.whois.com/whois/`,
      category: "official",
    },
  ];
}

function categoryLabel(category: LookupLink["category"]): string {
  if (category === "official") return "Official";
  if (category === "commercial") return "Commercial DB";
  return "Reputation";
}

export function CompanyLookupNavigatorTool() {
  const [companyName, setCompanyName] = useState("");
  const [domainInput, setDomainInput] = useState("");
  const [savedName, setSavedName] = useState("");
  const [savedDomain, setSavedDomain] = useState("");

  const normalizedDomain = useMemo(() => normalizeDomain(savedDomain), [savedDomain]);
  const links = useMemo(() => buildLinks(savedName, normalizedDomain), [savedName, normalizedDomain]);
  const canSearch = companyName.trim().length > 1;

  return (
    <section className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
      <div className="rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-6">
        <h2 className="text-xl font-semibold sm:text-2xl">Company Lookup Navigator</h2>
        <p className="mt-2 text-sm text-muted">
          Enter a company name once and open trusted business-information sources in one click.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1 sm:col-span-2">
            <span className="text-sm font-semibold text-foreground">Company Name</span>
            <input
              type="text"
              value={companyName}
              onChange={(event) => setCompanyName(event.target.value)}
              placeholder="e.g. Stripe, Inc."
              className="h-11 rounded-xl border border-line bg-white px-3 text-sm outline-none transition focus:border-brand"
            />
          </label>
          <label className="grid gap-1 sm:col-span-2">
            <span className="text-sm font-semibold text-foreground">Company Domain (Optional)</span>
            <input
              type="text"
              value={domainInput}
              onChange={(event) => setDomainInput(event.target.value)}
              placeholder="e.g. stripe.com"
              className="h-11 rounded-xl border border-line bg-white px-3 text-sm outline-none transition focus:border-brand"
            />
          </label>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              setSavedName(companyName.trim());
              setSavedDomain(domainInput.trim());
            }}
            disabled={!canSearch}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-50"
          >
            Generate Lookup Links
          </button>
          <button
            type="button"
            onClick={() => {
              setCompanyName("");
              setDomainInput("");
              setSavedName("");
              setSavedDomain("");
            }}
            className="rounded-lg border border-line px-4 py-2 text-sm font-semibold text-muted transition hover:border-brand hover:text-brand"
          >
            Clear
          </button>
        </div>

        <p className="mt-3 text-xs text-muted">
          Tip: include legal suffixes (Inc, LLC, Ltd) for better registry matching.
        </p>
      </div>

      <div className="grid gap-3">
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Prepared Query</p>
          <p className="mt-2 text-sm font-semibold text-foreground">{savedName || "No company selected yet."}</p>
          <p className="mt-1 text-xs text-muted">{normalizedDomain || "No domain provided."}</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Source Count</p>
          <p className="mt-2 text-3xl font-bold">{savedName ? links.length : 0}</p>
        </article>
      </div>

      {savedName ? (
        <div className="lg:col-span-2 rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-6">
          <h3 className="text-lg font-semibold sm:text-xl">Lookup Links</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {links.map((link) => (
              <a
                key={link.name}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="rounded-2xl border border-line bg-white p-4 transition hover:-translate-y-0.5 hover:border-brand"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-brand">
                  {categoryLabel(link.category)}
                </p>
                <p className="mt-2 text-sm font-semibold text-foreground">{link.name}</p>
                <p className="mt-2 text-xs leading-5 text-muted">{link.desc}</p>
              </a>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
