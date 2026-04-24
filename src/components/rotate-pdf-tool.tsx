"use client";

import { useMemo, useState } from "react";
import { degrees, PDFDocument } from "pdf-lib";

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

export function RotatePdfTool() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [pageRange, setPageRange] = useState("");
  const [rotation, setRotation] = useState<90 | 180 | 270>(90);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [rotatedPages, setRotatedPages] = useState(0);

  const rangeHint = useMemo(() => {
    if (!pageCount) return "Leave blank to rotate every page in the PDF.";
    return `PDF has ${pageCount} pages. Example ranges: 1-2, 4, 6-8. Leave blank to rotate all pages.`;
  }, [pageCount]);

  async function handleFile(nextFile: File) {
    setFile(nextFile);
    setError("");
    setRotatedPages(0);

    try {
      const bytes = await nextFile.arrayBuffer();
      const pdf = await PDFDocument.load(bytes);
      setPageCount(pdf.getPageCount());
    } catch {
      setPageCount(0);
      setError("Failed to read this PDF file.");
    }
  }

  async function handleRotate() {
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
      const selectedPages =
        pageRange.trim().length > 0
          ? parsePageRanges(pageRange, totalPages)
          : Array.from({ length: totalPages }, (_, index) => index);

      if (!selectedPages.length) {
        setError("Enter at least one valid page or leave the field blank to rotate all pages.");
        return;
      }

      selectedPages.forEach((pageIndex) => {
        const page = pdf.getPage(pageIndex);
        const currentRotation = page.getRotation().angle;
        page.setRotation(degrees((currentRotation + rotation) % 360));
      });

      const outputBytes = await pdf.save();
      const safeBytes = new Uint8Array(outputBytes);
      const blob = new Blob([safeBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${file.name.replace(/\.pdf$/i, "") || "document"}-rotated.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setRotatedPages(selectedPages.length);
    } catch {
      setError("Failed to rotate this PDF. Check the file and try again.");
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <section className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
      <div className="rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-6">
        <h2 className="text-xl font-semibold sm:text-2xl">Rotate PDF</h2>
        <p className="mt-2 text-sm text-muted">
          Rotate all pages or only selected pages in a PDF, then download the corrected document.
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

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Rotation</span>
            <select
              value={rotation}
              onChange={(event) => setRotation(Number(event.target.value) as 90 | 180 | 270)}
              className="h-11 rounded-xl border border-line bg-white px-3 text-sm outline-none transition focus:border-brand"
            >
              <option value={90}>Rotate 90° clockwise</option>
              <option value={180}>Rotate 180°</option>
              <option value={270}>Rotate 270° clockwise</option>
            </select>
          </label>

          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Pages To Rotate</span>
            <input
              type="text"
              value={pageRange}
              onChange={(event) => setPageRange(event.target.value)}
              placeholder="Blank = all pages"
              className="h-11 rounded-xl border border-line bg-white px-3 text-sm outline-none transition focus:border-brand"
            />
          </label>
        </div>

        <p className="mt-2 text-xs text-muted">{rangeHint}</p>

        <button
          type="button"
          onClick={() => void handleRotate()}
          disabled={!file || isProcessing}
          className="mt-4 rounded-xl border border-brand bg-brand px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isProcessing ? "Rotating..." : "Rotate and Download"}
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
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Rotated Pages</p>
          <p className="mt-2 text-3xl font-bold">{rotatedPages || "-"}</p>
          <p className="mt-1 text-xs text-muted">Rotate one page, a range, or the full document.</p>
        </article>
      </div>
    </section>
  );
}
