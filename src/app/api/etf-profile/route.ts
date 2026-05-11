import { NextResponse } from "next/server";

type AlphaVantageHolding = {
  symbol?: string;
  description?: string;
  weight?: string;
};

type AlphaVantageProfile = {
  holdings?: AlphaVantageHolding[];
  sectors?: { sector?: string; weight?: string }[];
  [key: string]: unknown;
};

function toPercent(weight: unknown): number {
  const raw = Number(weight);
  if (!Number.isFinite(raw)) return 0;
  return raw <= 1 ? raw * 100 : raw;
}

type ParsedHolding = {
  symbol: string;
  description: string;
  weightPct: number;
};

function normalizeFallbackSymbol(raw: string): string {
  const value = (raw || "").trim();
  if (!value) return "";
  if (value.startsWith("$")) return value.slice(1);
  if (value.startsWith("!krx/")) return `KRX:${value.slice(5)}`;
  return value;
}

function parseStockAnalysisHoldings(html: string): ParsedHolding[] {
  // StockAnalysis embeds holdings in page bootstrap data as:
  // holdings:[{no:1,n:"Name",s:"SYMBOL",as:"26.78%",...}, ...],asset_allocation:...
  const blockMatch = html.match(/holdings:\[([\s\S]*?)\],asset_allocation:/);
  if (!blockMatch || !blockMatch[1]) return [];
  const block = blockMatch[1];
  const results: ParsedHolding[] = [];
  const rowPattern = /\{no:\d+,n:"((?:\\"|[^"])*)",s:"((?:\\"|[^"])*)",as:"([\d.]+)%"/g;
  let match: RegExpExecArray | null = rowPattern.exec(block);
  while (match) {
    const description = match[1].replace(/\\"/g, '"').trim();
    const symbol = normalizeFallbackSymbol(match[2].replace(/\\"/g, '"'));
    const weightPct = Number(match[3]);
    if (symbol && Number.isFinite(weightPct) && weightPct > 0) {
      results.push({ symbol, description, weightPct });
    }
    match = rowPattern.exec(block);
  }
  return results;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = (searchParams.get("symbol") || "").trim().toUpperCase();
  if (!symbol) {
    return NextResponse.json({ error: "symbol is required" }, { status: 400 });
  }

  const apiKey = process.env.ALPHA_VANTAGE_API_KEY || "demo";
  const endpoint = `https://www.alphavantage.co/query?function=ETF_PROFILE&symbol=${encodeURIComponent(symbol)}&apikey=${encodeURIComponent(apiKey)}`;

  try {
    const res = await fetch(endpoint, { cache: "no-store" });
    if (!res.ok) {
      return NextResponse.json({ error: `upstream error: ${res.status}` }, { status: 502 });
    }

    const data = (await res.json()) as AlphaVantageProfile & {
      Note?: string;
      Information?: string;
      ErrorMessage?: string;
    };

    if (data.ErrorMessage) {
      return NextResponse.json({ error: data.ErrorMessage }, { status: 400 });
    }
    if (data.Note) {
      return NextResponse.json({ error: data.Note }, { status: 429 });
    }
    if (data.Information) {
      return NextResponse.json({ error: data.Information }, { status: 400 });
    }

    const holdingsFromAlpha = Array.isArray(data.holdings)
      ? data.holdings
          .map((item) => ({
            symbol: (item.symbol || "").trim(),
            description: (item.description || "").trim(),
            weightPct: toPercent(item.weight),
          }))
          .filter((item) => item.symbol && item.weightPct > 0)
      : [];

    if (holdingsFromAlpha.length > 0) {
      return NextResponse.json({
        symbol,
        holdings: holdingsFromAlpha,
        sectors: Array.isArray(data.sectors) ? data.sectors : [],
        source: "Alpha Vantage ETF_PROFILE",
      });
    }

    // Fallback for newly listed ETFs where ETF_PROFILE may lag holdings coverage.
    const fallbackUrl = `https://stockanalysis.com/etf/${symbol.toLowerCase()}/holdings/`;
    try {
      const fallbackRes = await fetch(fallbackUrl, {
        cache: "no-store",
        headers: {
          "user-agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        },
      });
      if (fallbackRes.ok) {
        const fallbackHtml = await fallbackRes.text();
        const fallbackHoldings = parseStockAnalysisHoldings(fallbackHtml);
        if (fallbackHoldings.length > 0) {
          return NextResponse.json({
            symbol,
            holdings: fallbackHoldings,
            sectors: [],
            source: "StockAnalysis holdings fallback",
          });
        }
      }
    } catch {
      // Ignore fallback errors and return a clean business error below.
    }

    return NextResponse.json(
      {
        error: `No holdings returned for ${symbol}. This ETF may be newly listed or not covered by current providers yet.`,
      },
      { status: 404 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "request failed" },
      { status: 500 },
    );
  }
}
