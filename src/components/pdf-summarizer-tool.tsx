"use client";

import { useMemo, useState } from "react";

const STOP_WORDS = new Set([
  "the", "a", "an", "and", "or", "of", "to", "in", "on", "for", "with", "at", "by", "from",
  "is", "are", "was", "were", "be", "been", "being", "that", "this", "it", "as", "not", "but",
  "if", "then", "than", "into", "about", "over", "under", "we", "you", "they", "he", "she",
]);

type SummaryMode = "short" | "medium" | "long";

function splitSentences(text: string): string[] {
  return text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 35);
}

function topKeywords(text: string, limit = 8): string[] {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3 && !STOP_WORDS.has(w));
  const freq = new Map<string, number>();
  words.forEach((w) => freq.set(w, (freq.get(w) ?? 0) + 1));
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map((item) => item[0]);
}

function summarizeText(text: string, mode: SummaryMode): { summary: string[]; points: string[] } {
  const sentences = splitSentences(text);
  if (!sentences.length) return { summary: [], points: [] };

  const keywordList = topKeywords(text, 12);
  const keywordSet = new Set(keywordList);

  const scored = sentences.map((sentence, idx) => {
    const words = sentence
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter(Boolean);

    const keywordHits = words.reduce((sum, w) => sum + (keywordSet.has(w) ? 1 : 0), 0);
    const positionBonus = idx < 5 ? 1.2 : idx < 15 ? 0.6 : 0;
    const lengthPenalty = words.length > 45 ? 0.6 : 1;
    const score = (keywordHits + positionBonus) * lengthPenalty;
    return { sentence, score, idx };
  });

  const takeCount = mode === "short" ? 3 : mode === "medium" ? 5 : 7;
  const topSentences = [...scored]
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.min(takeCount, scored.length))
    .sort((a, b) => a.idx - b.idx)
    .map((item) => item.sentence);

  const points = topSentences.slice(0, Math.min(5, topSentences.length));
  return { summary: topSentences, points };
}

export function PdfSummarizerTool() {
  const [fileName, setFileName] = useState("");
  const [mode, setMode] = useState<SummaryMode>("medium");
  const [isLoading, setIsLoading] = useState(false);
  const [sourceText, setSourceText] = useState("");
  const [error, setError] = useState("");

  const result = useMemo(() => summarizeText(sourceText, mode), [sourceText, mode]);

  async function extractPdfText(file: File) {
    setFileName(file.name);
    setIsLoading(true);
    setError("");
    setSourceText("");

    try {
      const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
      const workerVersion = (pdfjsLib as { version?: string }).version ?? "4.10.38";
      pdfjsLib.GlobalWorkerOptions.workerSrc =
        `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${workerVersion}/pdf.worker.min.mjs`;

      const bytes = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;

      let text = "";
      const maxPages = Math.min(pdf.numPages, 40);
      for (let pageNum = 1; pageNum <= maxPages; pageNum += 1) {
        const page = await pdf.getPage(pageNum);
        const content = await page.getTextContent();
        const pageText = content.items
          .map((item) => ("str" in item ? item.str : ""))
          .join(" ");
        text += ` ${pageText}`;
      }

      const cleaned = text.replace(/\s+/g, " ").trim();
      if (!cleaned || cleaned.length < 80) {
        setError("Could not extract enough text from this PDF.");
      } else {
        setSourceText(cleaned);
      }
    } catch {
      setError("Failed to process this PDF. Try another file.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
      <div className="rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-6">
        <h2 className="text-xl font-semibold sm:text-2xl">PDF Summarizer</h2>
        <p className="mt-2 text-sm text-muted">
          Upload a PDF and generate a fast summary with key points in your browser.
        </p>

        <label className="mt-4 block rounded-2xl border border-dashed border-line bg-white p-4 text-sm text-muted">
          <span className="font-semibold text-foreground">Upload PDF</span>
          <input
            type="file"
            accept="application/pdf,.pdf"
            className="mt-3 block w-full text-sm"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                void extractPdfText(file);
              }
            }}
          />
          {fileName ? <span className="mt-2 block text-xs text-foreground">Loaded: {fileName}</span> : null}
        </label>

        <label className="mt-4 grid gap-1">
          <span className="text-sm font-semibold text-foreground">Summary Length</span>
          <select
            value={mode}
            onChange={(event) => setMode(event.target.value as SummaryMode)}
            className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
          >
            <option value="short">Short</option>
            <option value="medium">Medium</option>
            <option value="long">Long</option>
          </select>
        </label>

        {error ? <p className="mt-3 text-sm font-semibold text-rose-700">{error}</p> : null}
      </div>

      <div className="grid gap-3">
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Status</p>
          <p className="mt-2 text-base font-semibold text-foreground">
            {isLoading
              ? "Analyzing PDF..."
              : sourceText
                ? "Summary ready"
                : "Waiting for upload"}
          </p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Extracted Characters</p>
          <p className="mt-2 text-3xl font-bold">{sourceText.length.toLocaleString()}</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Summary Sentences</p>
          <p className="mt-2 text-3xl font-bold">{result.summary.length}</p>
        </article>
      </div>

      {result.summary.length > 0 ? (
        <div className="lg:col-span-2 grid gap-4 lg:grid-cols-2">
          <article className="rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-6">
            <h3 className="text-lg font-semibold sm:text-xl">Key Points</h3>
            <ul className="mt-3 space-y-2 text-sm text-foreground">
              {result.points.map((point) => (
                <li key={point} className="rounded-lg border border-line bg-white px-3 py-2">
                  {point}
                </li>
              ))}
            </ul>
          </article>
          <article className="rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-6">
            <h3 className="text-lg font-semibold sm:text-xl">Summary</h3>
            <div className="mt-3 space-y-2 text-sm text-foreground">
              {result.summary.map((sentence) => (
                <p key={sentence} className="rounded-lg border border-line bg-white px-3 py-2">
                  {sentence}
                </p>
              ))}
            </div>
          </article>
        </div>
      ) : null}
    </section>
  );
}

