"use client";

import { useMemo, useState } from "react";
import { PDFDocument } from "pdf-lib";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function parsePageRanges(input: string, pageCount: number): number[] {
  const selected = new Set<number>();
  const parts = input
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  for (const part of parts) {
    if (part.includes("-")) {
      const [rawStart, rawEnd] = part.split("-").map((value) => Number(value.trim()));
      if (!Number.isFinite(rawStart) || !Number.isFinite(rawEnd)) continue;
      const start = Math.max(1, Math.min(rawStart, rawEnd));
      const end = Math.min(pageCount, Math.max(rawStart, rawEnd));
      for (let page = start; page <= end; page += 1) {
        selected.add(page - 1);
      }
    } else {
      const page = Number(part);
      if (Number.isFinite(page) && page >= 1 && page <= pageCount) {
        selected.add(page - 1);
      }
    }
  }

  return [...selected].sort((a, b) => a - b);
}

export function SplitPdfTool() {
  const [file, setFile] = useState<File | null>(null);
  const [pageRange, setPageRange] = useState("1-2");
  const [pageCount, setPageCount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [selectedCount, setSelectedCount] = useState(0);

  const selectedSummary = useMemo(() => {
    if (!pageCount) return "Upload a PDF to begin.";
    return `PDF has ${pageCount} pages. Example ranges: 1-3, 5, 8-10`;
  }, [pageCount]);

  async function handleFile(nextFile: File) {
    setFile(nextFile);
    setError("");
    setSelectedCount(0);

    try {
      const bytes = await nextFile.arrayBuffer();
      const pdf = await PDFDocument.load(bytes);
      setPageCount(pdf.getPageCount());
    } catch {
      setPageCount(0);
      setError("Failed to read this PDF file.");
    }
  }

  async function handleSplit() {
    if (!file) {
      setError("Please upload a PDF file first.");
      return;
    }

    try {
      setIsProcessing(true);
      setError("");

      const bytes = await file.arrayBuffer();
      const pdf = await PDFDocument.load(bytes);
      const totalPages = pdf.getPageCount();
      const selectedPages = parsePageRanges(pageRange, totalPages);
      setSelectedCount(selectedPages.length);

      if (!selectedPages.length) {
        setError("Enter at least one valid page or page range.");
        return;
      }

      const output = await PDFDocument.create();
      const copiedPages = await output.copyPages(pdf, selectedPages);
      copiedPages.forEach((page) => output.addPage(page));

      const outputBytes = await output.save();
      const safeBytes = new Uint8Array(outputBytes);
      const blob = new Blob([safeBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${file.name.replace(/\.pdf$/i, "") || "document"}-split.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      setError("Failed to split PDF. Check the page range and try again.");
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <section className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
      <div className="rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-6">
        <h2 className="text-xl font-semibold sm:text-2xl">Split PDF</h2>
        <p className="mt-2 text-sm text-muted">
          Extract selected PDF pages into a new smaller file using simple page ranges.
        </p>

        <label className="mt-4 block rounded-2xl border border-dashed border-line bg-white p-4 text-sm text-muted">
          <span className="font-semibold text-foreground">Upload PDF</span>
          <input
            type="file"
            accept="application/pdf,.pdf"
            className="mt-3 block w-full text-sm"
            onChange={(event) => {
              const next = event.target.files?.[0];
              if (next) {
                void handleFile(next);
              }
            }}
          />
          {file ? <span className="mt-2 block text-xs text-foreground">Loaded: {file.name}</span> : null}
        </label>

        <label className="mt-4 grid gap-1">
          <span className="text-sm font-semibold text-foreground">Pages To Extract</span>
          <input
            type="text"
            value={pageRange}
            onChange={(event) => setPageRange(event.target.value)}
            placeholder="Example: 1-3, 5, 8-10"
            className="h-11 rounded-xl border border-line bg-white px-3 text-sm outline-none transition focus:border-brand"
          />
          <span className="text-xs text-muted">{selectedSummary}</span>
        </label>

        <button
          type="button"
          onClick={() => void handleSplit()}
          disabled={!file || isProcessing}
          className="mt-4 rounded-xl border border-brand bg-brand px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isProcessing ? "Splitting..." : "Split and Download"}
        </button>

        {error ? <p className="mt-3 text-sm font-semibold text-rose-700">{error}</p> : null}
      </div>

      <div className="grid gap-3">
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Original Size</p>
          <p className="mt-2 text-3xl font-bold">{file ? formatBytes(file.size) : "-"}</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Total Pages</p>
          <p className="mt-2 text-3xl font-bold">{pageCount || "-"}</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Selected Pages</p>
          <p className="mt-2 text-3xl font-bold">{selectedCount || "-"}</p>
          <p className="mt-1 text-xs text-muted">
            Use commas and ranges to extract exactly the pages you need.
          </p>
        </article>
      </div>
    </section>
  );
}
