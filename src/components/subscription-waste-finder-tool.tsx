"use client";

import { useMemo, useState } from "react";

type Frequency = "weekly" | "biweekly" | "monthly" | "quarterly" | "yearly";

type Transaction = {
  date: Date;
  merchant: string;
  amount: number;
};

type MerchantSummary = {
  merchant: string;
  frequency: Frequency;
  monthlyCost: number;
  annualCost: number;
  count: number;
  firstAmount: number;
  lastAmount: number;
  lastDate: Date;
  tags: string[];
};

type ColumnMapping = {
  dateIdx: number;
  descIdx: number;
  amountIdx: number;
  debitIdx: number;
  creditIdx: number;
};

type ParseResult = {
  summaries: MerchantSummary[];
  rows: number;
  totalSpend: number;
  categoryBreakdown: Array<{
    category: string;
    amount: number;
    percent: number;
  }>;
};

type RawCsv = {
  headers: string[];
  rows: string[][];
};

type BankPreset = "auto" | "chase" | "bofa" | "amex" | "citi" | "manual";

const HEADER_ALIASES = {
  date: ["date", "transaction date", "posted date", "post date"],
  description: ["description", "merchant", "name", "memo", "details", "payee"],
  amount: ["amount", "transaction amount"],
  debit: ["debit", "withdrawal", "outflow"],
  credit: ["credit", "deposit", "inflow"],
};

const PRESET_ALIASES: Record<Exclude<BankPreset, "manual">, typeof HEADER_ALIASES> = {
  auto: HEADER_ALIASES,
  chase: {
    date: ["transaction date", "post date", "date"],
    description: ["description", "merchant", "name"],
    amount: ["amount"],
    debit: ["debit"],
    credit: ["credit"],
  },
  bofa: {
    date: ["date", "posted date"],
    description: ["description", "merchant", "payee"],
    amount: ["amount", "transaction amount"],
    debit: ["debit"],
    credit: ["credit"],
  },
  amex: {
    date: ["date", "posted date"],
    description: ["description", "appears on your statement as", "merchant"],
    amount: ["amount"],
    debit: ["debit"],
    credit: ["credit"],
  },
  citi: {
    date: ["date", "posted date"],
    description: ["description", "merchant name", "merchant"],
    amount: ["amount"],
    debit: ["debit"],
    credit: ["credit"],
  },
};

const TERM_TO_GROUP: Array<{ test: RegExp; group: string }> = [
  { test: /NETFLIX|HULU|DISNEY|MAX|HBO|PARAMOUNT|PEACOCK|APPLE TV|YOUTUBE|SPOTIFY/i, group: "streaming" },
  { test: /GYM|FITNESS|PLANET FITNESS|EQUINOX|CLASS PASS/i, group: "fitness" },
  { test: /ICLOUD|DROPBOX|GOOGLE ONE|ONEDRIVE|NOTION|CANVA|CHATGPT|MIDJOURNEY|ADOBE/i, group: "software" },
  { test: /AMAZON PRIME|WALMART\+|COSTCO/i, group: "membership" },
];

const CATEGORY_RULES: Array<{ category: string; test: RegExp }> = [
  { category: "Food & Dining", test: /STARBUCKS|MCDONALD|UBER EATS|DOORDASH|GRUBHUB|RESTAURANT|CAFE|PIZZA|TACO/i },
  { category: "Transport", test: /UBER|LYFT|SHELL|EXXON|CHEVRON|BP|MOBIL|GAS|PARKING|TRANSIT/i },
  { category: "Shopping", test: /AMAZON|WALMART|TARGET|COSTCO|EBAY|BEST BUY|NIKE|APPLE STORE/i },
  { category: "Utilities", test: /COMCAST|VERIZON|AT&T|T-MOBILE|WATER|ELECTRIC|UTILITY|INTERNET/i },
  { category: "Health & Fitness", test: /CVS|WALGREENS|PLANET FITNESS|EQUINOX|GYM|HEALTH|DENTAL/i },
  { category: "Travel", test: /AIRBNB|BOOKING|DELTA|UNITED|MARRIOTT|HILTON|HOTEL|AIRLINES/i },
  { category: "Subscriptions", test: /NETFLIX|HULU|DISNEY|MAX|SPOTIFY|YOUTUBE|ICLOUD|DROPBOX|ADOBE|CHATGPT|PRIME/i },
];

const PIE_COLORS = ["#0EA5E9", "#22C55E", "#F59E0B", "#EF4444", "#8B5CF6", "#14B8A6", "#F97316", "#64748B"];

function parseAmount(value: string): number {
  const cleaned = value.replace(/[$,\s]/g, "").trim();
  if (!cleaned) return 0;
  if (cleaned.startsWith("(") && cleaned.endsWith(")")) {
    const n = Number(cleaned.slice(1, -1));
    return Number.isFinite(n) ? -n : 0;
  }
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

function money(value: number): string {
  return value.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function parseCsvLine(line: string, delimiter: string): string[] {
  const cells: string[] = [];
  let cur = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (ch === delimiter && !inQuotes) {
      cells.push(cur.trim());
      cur = "";
      continue;
    }
    cur += ch;
  }
  cells.push(cur.trim());
  return cells;
}

function detectDelimiter(headerLine: string): string {
  const candidates = [",", ";", "\t"];
  let best = ",";
  let bestCount = -1;
  for (const c of candidates) {
    const count = headerLine.split(c).length;
    if (count > bestCount) {
      best = c;
      bestCount = count;
    }
  }
  return best;
}

function normalizeHeader(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function findHeaderIndex(headers: string[], aliases: string[]): number {
  for (let i = 0; i < headers.length; i += 1) {
    if (aliases.includes(headers[i])) return i;
  }
  return -1;
}

function normalizeMerchant(raw: string): string {
  const up = raw
    .toUpperCase()
    .replace(/HTTPS?:\/\/\S+/g, " ")
    .replace(/\d+/g, " ")
    .replace(/[^A-Z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const noise = new Set([
    "POS",
    "PURCHASE",
    "DEBIT",
    "CREDIT",
    "CARD",
    "ONLINE",
    "PAYMENT",
    "AUTOPAY",
    "RECURRING",
    "CHECKCARD",
    "WITHDRAWAL",
  ]);

  const words = up.split(" ").filter((w) => w && !noise.has(w));
  return (words.slice(0, 4).join(" ") || raw.trim()).slice(0, 48);
}

function detectFrequency(avgGapDays: number): Frequency | null {
  if (avgGapDays >= 6 && avgGapDays <= 8) return "weekly";
  if (avgGapDays >= 13 && avgGapDays <= 15) return "biweekly";
  if (avgGapDays >= 25 && avgGapDays <= 35) return "monthly";
  if (avgGapDays >= 80 && avgGapDays <= 100) return "quarterly";
  if (avgGapDays >= 350 && avgGapDays <= 380) return "yearly";
  return null;
}

function frequencyToMonthly(amount: number, frequency: Frequency): number {
  if (frequency === "weekly") return (amount * 52) / 12;
  if (frequency === "biweekly") return (amount * 26) / 12;
  if (frequency === "monthly") return amount;
  if (frequency === "quarterly") return amount / 3;
  return amount / 12;
}

function classifyGroup(merchant: string): string | null {
  for (const item of TERM_TO_GROUP) {
    if (item.test.test(merchant)) return item.group;
  }
  return null;
}

function classifyExpenseCategory(merchant: string): string {
  for (const rule of CATEGORY_RULES) {
    if (rule.test.test(merchant)) return rule.category;
  }
  return "Other";
}

function parseCsvText(csvText: string): RawCsv {
  const lines = csvText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) return { headers: [], rows: [] };

  const delimiter = detectDelimiter(lines[0]);
  const headers = parseCsvLine(lines[0], delimiter).map((item) => item.trim());
  const rows: string[][] = [];
  for (let i = 1; i < lines.length; i += 1) {
    rows.push(parseCsvLine(lines[i], delimiter));
  }
  return { headers, rows };
}

function getAutoMapping(headers: string[]): ColumnMapping {
  const normalized = headers.map(normalizeHeader);
  return {
    dateIdx: findHeaderIndex(normalized, HEADER_ALIASES.date),
    descIdx: findHeaderIndex(normalized, HEADER_ALIASES.description),
    amountIdx: findHeaderIndex(normalized, HEADER_ALIASES.amount),
    debitIdx: findHeaderIndex(normalized, HEADER_ALIASES.debit),
    creditIdx: findHeaderIndex(normalized, HEADER_ALIASES.credit),
  };
}

function getPresetMapping(headers: string[], preset: Exclude<BankPreset, "manual">): ColumnMapping {
  const normalized = headers.map(normalizeHeader);
  const aliases = PRESET_ALIASES[preset];

  const autoMapping = getAutoMapping(headers);
  const dateIdx = findHeaderIndex(normalized, aliases.date);
  const descIdx = findHeaderIndex(normalized, aliases.description);
  const amountIdx = findHeaderIndex(normalized, aliases.amount);
  const debitIdx = findHeaderIndex(normalized, aliases.debit);
  const creditIdx = findHeaderIndex(normalized, aliases.credit);

  return {
    dateIdx: dateIdx >= 0 ? dateIdx : autoMapping.dateIdx,
    descIdx: descIdx >= 0 ? descIdx : autoMapping.descIdx,
    amountIdx: amountIdx >= 0 ? amountIdx : autoMapping.amountIdx,
    debitIdx: debitIdx >= 0 ? debitIdx : autoMapping.debitIdx,
    creditIdx: creditIdx >= 0 ? creditIdx : autoMapping.creditIdx,
  };
}

function parseTransactions(rawCsv: RawCsv, mapping: ColumnMapping): ParseResult {
  const { headers, rows } = rawCsv;
  const { dateIdx, descIdx, amountIdx, debitIdx, creditIdx } = mapping;

  if (!headers.length || !rows.length) {
    return { summaries: [], rows: 0, totalSpend: 0, categoryBreakdown: [] };
  }

  if (dateIdx < 0 || descIdx < 0 || (amountIdx < 0 && debitIdx < 0)) {
    throw new Error("CSV columns not recognized. Need date + description + amount/debit.");
  }

  const txs: Transaction[] = [];
  for (let i = 0; i < rows.length; i += 1) {
    const cols = rows[i];
    const date = new Date(cols[dateIdx] ?? "");
    const desc = (cols[descIdx] ?? "").trim();
    if (!desc || Number.isNaN(date.getTime())) continue;

    let amount = 0;
    if (amountIdx >= 0) {
      amount = parseAmount(cols[amountIdx] ?? "");
    } else {
      const debit = parseAmount(cols[debitIdx] ?? "");
      const credit = creditIdx >= 0 ? parseAmount(cols[creditIdx] ?? "") : 0;
      amount = credit - debit;
    }

    const spend = Math.abs(amount);
    if (spend <= 0) continue;
    txs.push({ date, merchant: normalizeMerchant(desc), amount: spend });
  }

  const grouped = new Map<string, Transaction[]>();
  const categorySpend = new Map<string, number>();
  let totalSpend = 0;
  for (const tx of txs) {
    const list = grouped.get(tx.merchant) ?? [];
    list.push(tx);
    grouped.set(tx.merchant, list);

    totalSpend += tx.amount;
    const category = classifyExpenseCategory(tx.merchant);
    categorySpend.set(category, (categorySpend.get(category) ?? 0) + tx.amount);
  }

  const summaries: MerchantSummary[] = [];
  for (const [merchant, items] of grouped.entries()) {
    if (items.length < 2) continue;
    const sorted = [...items].sort((a, b) => a.date.getTime() - b.date.getTime());
    const gaps: number[] = [];
    for (let i = 1; i < sorted.length; i += 1) {
      const ms = sorted[i].date.getTime() - sorted[i - 1].date.getTime();
      gaps.push(ms / (1000 * 60 * 60 * 24));
    }
    const avgGap = gaps.reduce((a, b) => a + b, 0) / gaps.length;
    const frequency = detectFrequency(avgGap);
    if (!frequency) continue;

    const avgAmount = sorted.reduce((sum, x) => sum + x.amount, 0) / sorted.length;
    const firstAmount = sorted[0].amount;
    const lastAmount = sorted[sorted.length - 1].amount;
    const monthlyCost = frequencyToMonthly(avgAmount, frequency);
    const annualCost = monthlyCost * 12;
    const tags: string[] = [];
    if (lastAmount > firstAmount * 1.08) tags.push("Price Increased");

    summaries.push({
      merchant,
      frequency,
      monthlyCost,
      annualCost,
      count: sorted.length,
      firstAmount,
      lastAmount,
      lastDate: sorted[sorted.length - 1].date,
      tags,
    });
  }

  const groupedTypeCount = new Map<string, number>();
  for (const s of summaries) {
    const group = classifyGroup(s.merchant);
    if (!group) continue;
    groupedTypeCount.set(group, (groupedTypeCount.get(group) ?? 0) + 1);
  }

  const finalSummaries = summaries.map((s) => {
    const group = classifyGroup(s.merchant);
    const tags = [...s.tags];
    if (group && (groupedTypeCount.get(group) ?? 0) >= 2) {
      tags.push("Possible Duplicate");
    }
    return { ...s, tags };
  });

  finalSummaries.sort((a, b) => b.monthlyCost - a.monthlyCost);
  const categoryBreakdown = [...categorySpend.entries()]
    .map(([category, amount]) => ({
      category,
      amount,
      percent: totalSpend > 0 ? (amount / totalSpend) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  return {
    summaries: finalSummaries,
    rows: txs.length,
    totalSpend,
    categoryBreakdown,
  };
}

function toCsv(rows: MerchantSummary[]): string {
  const header = "merchant,frequency,monthly_cost,annual_cost,tags,last_charge_date";
  const body = rows
    .map((r) =>
      [
        r.merchant,
        r.frequency,
        r.monthlyCost.toFixed(2),
        r.annualCost.toFixed(2),
        `"${r.tags.join(" | ")}"`,
        r.lastDate.toISOString().slice(0, 10),
      ].join(","),
    )
    .join("\n");
  return `${header}\n${body}`;
}

export function SubscriptionWasteFinderTool() {
  const [fileName, setFileName] = useState("");
  const [result, setResult] = useState<ParseResult | null>(null);
  const [rawCsv, setRawCsv] = useState<RawCsv | null>(null);
  const [mapping, setMapping] = useState<ColumnMapping | null>(null);
  const [preset, setPreset] = useState<BankPreset>("auto");
  const [error, setError] = useState("");

  const totals = useMemo(() => {
    const summaries = result?.summaries ?? [];
    const monthly = summaries.reduce((sum, s) => sum + s.monthlyCost, 0);
    const annual = monthly * 12;
    const risky = summaries.filter((s) => s.tags.length > 0);
    const riskyMonthly = risky.reduce((sum, s) => sum + s.monthlyCost, 0);
    return {
      monthly,
      annual,
      riskyCount: risky.length,
      riskyMonthly,
      risky,
      totalSpend: result?.totalSpend ?? 0,
      categoryBreakdown: result?.categoryBreakdown ?? [],
    };
  }, [result]);

  const pieGradient = useMemo(() => {
    const items = totals.categoryBreakdown.slice(0, 8);
    if (!items.length) return "";
    let start = 0;
    const segments = items.map((item, index) => {
      const end = start + item.percent;
      const color = PIE_COLORS[index % PIE_COLORS.length];
      const segment = `${color} ${start.toFixed(2)}% ${end.toFixed(2)}%`;
      start = end;
      return segment;
    });
    if (start < 100) {
      segments.push(`#E5E7EB ${start.toFixed(2)}% 100%`);
    }
    return `conic-gradient(${segments.join(", ")})`;
  }, [totals.categoryBreakdown]);

  async function handleFile(file: File) {
    setFileName(file.name);
    setError("");
    try {
      const text = await file.text();
      const parsedRaw = parseCsvText(text);
      const autoMapping = getPresetMapping(parsedRaw.headers, "auto");
      const parsed = parseTransactions(parsedRaw, autoMapping);
      setRawCsv(parsedRaw);
      setMapping(autoMapping);
      setPreset("auto");
      setResult(parsed);
    } catch {
      setRawCsv(null);
      setMapping(null);
      setPreset("auto");
      setResult(null);
      setError("Could not parse this CSV. Use columns like date, description, amount.");
    }
  }

  function applyMapping(next: ColumnMapping) {
    setMapping(next);
    if (!rawCsv) return;
    try {
      const parsed = parseTransactions(rawCsv, next);
      setResult(parsed);
      setError("");
    } catch {
      setResult(null);
      setError("Column mapping is incomplete. Select date, description, and amount/debit.");
    }
  }

  function applyPreset(nextPreset: Exclude<BankPreset, "manual">) {
    setPreset(nextPreset);
    if (!rawCsv) return;
    applyMapping(getPresetMapping(rawCsv.headers, nextPreset));
  }

  function downloadCancelList() {
    if (!totals.risky.length) return;
    const blob = new Blob([toCsv(totals.risky)], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "subscription-cancel-list.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
      <div className="rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-6">
        <h2 className="text-xl font-semibold sm:text-2xl">Subscription Waste Finder</h2>
        <p className="mt-2 text-sm text-muted">
          Upload a bank or card CSV to detect recurring subscriptions, price increases, and possible duplicates.
        </p>
        <p className="mt-2 text-xs text-muted">Privacy: your file is parsed only in your browser.</p>

        <label className="mt-4 block rounded-2xl border border-dashed border-line bg-white p-4 text-sm text-muted">
          <span className="font-semibold text-foreground">Upload CSV</span>
          <input
            type="file"
            accept=".csv,text/csv"
            className="mt-3 block w-full text-sm"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                void handleFile(file);
              }
            }}
          />
          <span className="mt-2 block text-xs">
            Expected columns: date, description, amount (or debit + credit).
          </span>
          {fileName ? <span className="mt-2 block text-xs text-foreground">Loaded: {fileName}</span> : null}
        </label>

        {rawCsv && mapping ? (
          <div className="mt-4 grid gap-2 rounded-2xl border border-line bg-white p-3 sm:grid-cols-2">
            <label className="grid gap-1 sm:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                Bank Preset
              </span>
              <select
                value={preset}
                onChange={(event) => {
                  const value = event.target.value as BankPreset;
                  if (value !== "manual") {
                    applyPreset(value);
                  }
                }}
                className="h-9 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
              >
                <option value="auto">Auto Detect</option>
                <option value="chase">Chase</option>
                <option value="bofa">Bank of America</option>
                <option value="amex">American Express</option>
                <option value="citi">Citi</option>
                <option value="manual">Manual (custom mapping)</option>
              </select>
            </label>
            <label className="grid gap-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted">Date Column</span>
              <select
                value={mapping.dateIdx}
                onChange={(event) => {
                  setPreset("manual");
                  applyMapping({ ...mapping, dateIdx: Number(event.target.value) });
                }}
                className="h-9 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
              >
                <option value={-1}>Select</option>
                {rawCsv.headers.map((header, index) => (
                  <option key={`date-${index}`} value={index}>
                    {header || `Column ${index + 1}`}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                Description Column
              </span>
              <select
                value={mapping.descIdx}
                onChange={(event) => {
                  setPreset("manual");
                  applyMapping({ ...mapping, descIdx: Number(event.target.value) });
                }}
                className="h-9 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
              >
                <option value={-1}>Select</option>
                {rawCsv.headers.map((header, index) => (
                  <option key={`desc-${index}`} value={index}>
                    {header || `Column ${index + 1}`}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted">Amount Column</span>
              <select
                value={mapping.amountIdx}
                onChange={(event) => {
                  setPreset("manual");
                  applyMapping({ ...mapping, amountIdx: Number(event.target.value) });
                }}
                className="h-9 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
              >
                <option value={-1}>Not used (use Debit/Credit)</option>
                {rawCsv.headers.map((header, index) => (
                  <option key={`amount-${index}`} value={index}>
                    {header || `Column ${index + 1}`}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted">Debit Column</span>
              <select
                value={mapping.debitIdx}
                onChange={(event) => {
                  setPreset("manual");
                  applyMapping({ ...mapping, debitIdx: Number(event.target.value) });
                }}
                className="h-9 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
              >
                <option value={-1}>Optional</option>
                {rawCsv.headers.map((header, index) => (
                  <option key={`debit-${index}`} value={index}>
                    {header || `Column ${index + 1}`}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted">Credit Column</span>
              <select
                value={mapping.creditIdx}
                onChange={(event) => {
                  setPreset("manual");
                  applyMapping({ ...mapping, creditIdx: Number(event.target.value) });
                }}
                className="h-9 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
              >
                <option value={-1}>Optional</option>
                {rawCsv.headers.map((header, index) => (
                  <option key={`credit-${index}`} value={index}>
                    {header || `Column ${index + 1}`}
                  </option>
                ))}
              </select>
            </label>
          </div>
        ) : null}

        {error ? <p className="mt-3 text-sm font-semibold text-red-600">{error}</p> : null}
      </div>

      <div className="grid gap-3">
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Total Spend Parsed</p>
          <p className="mt-2 text-3xl font-bold">{money(totals.totalSpend)}</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Detected Subscriptions</p>
          <p className="mt-2 text-3xl font-bold">{(result?.summaries.length ?? 0).toLocaleString()}</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Monthly Subscription Spend</p>
          <p className="mt-2 text-3xl font-bold text-brand">{money(totals.monthly)}</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Annual Subscription Spend</p>
          <p className="mt-2 text-3xl font-bold">{money(totals.annual)}</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Potential Waste (Monthly)</p>
          <p className="mt-2 text-3xl font-bold">{money(totals.riskyMonthly)}</p>
        </article>
      </div>

      {result ? (
        <div className="lg:col-span-2 rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-lg font-semibold sm:text-xl">Detected Recurring Charges</h3>
            <button
              type="button"
              onClick={downloadCancelList}
              disabled={totals.risky.length === 0}
              className="rounded-md border border-line px-3 py-2 text-xs font-semibold transition hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-50"
            >
              Export Cancel List CSV
            </button>
          </div>
          <p className="mt-2 text-xs text-muted">
            Parsed {result.rows.toLocaleString()} transactions. Recurring items are inferred by charge interval patterns.
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs uppercase tracking-wide text-muted">
                  <th className="px-2 py-2">Merchant</th>
                  <th className="px-2 py-2">Frequency</th>
                  <th className="px-2 py-2">Monthly</th>
                  <th className="px-2 py-2">Annual</th>
                  <th className="px-2 py-2">Tags</th>
                </tr>
              </thead>
              <tbody>
                {result.summaries.slice(0, 50).map((row) => (
                  <tr key={`${row.merchant}-${row.frequency}`} className="border-b border-line/70">
                    <td className="px-2 py-2 font-semibold">{row.merchant}</td>
                    <td className="px-2 py-2 capitalize">{row.frequency}</td>
                    <td className="px-2 py-2">{money(row.monthlyCost)}</td>
                    <td className="px-2 py-2">{money(row.annualCost)}</td>
                    <td className="px-2 py-2">
                      {row.tags.length ? (
                        <span className="rounded-md bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-800">
                          {row.tags.join(", ")}
                        </span>
                      ) : (
                        <span className="text-xs text-muted">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {result && totals.categoryBreakdown.length > 0 ? (
        <div className="lg:col-span-2 rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-6">
          <h3 className="text-lg font-semibold sm:text-xl">Spending Category Breakdown</h3>
          <p className="mt-2 text-xs text-muted">
            Category analysis is estimated from merchant keywords and parsed transaction descriptions.
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-[220px_minmax(0,1fr)]">
            <div className="flex items-center justify-center">
              <div
                aria-label="Spending category pie chart"
                className="h-52 w-52 rounded-full border border-line"
                style={{ background: pieGradient }}
              />
            </div>
            <div className="space-y-2">
              {totals.categoryBreakdown.slice(0, 8).map((item, index) => (
                <div key={item.category} className="flex items-center justify-between rounded-lg border border-line bg-white px-3 py-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block h-3 w-3 rounded-full"
                      style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                    />
                    <span className="font-semibold">{item.category}</span>
                  </div>
                  <span className="text-muted">
                    {money(item.amount)} ({item.percent.toFixed(1)}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
