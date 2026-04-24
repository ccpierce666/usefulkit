"use client";

import { useState } from "react";
import { PDFDocument } from "pdf-lib";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

type CompressionMode = "balanced" | "strong";

export function CompressPdfTool() {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<CompressionMode>("balanced");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [resultSize, setResultSize] = useState<number | null>(null);
  const [savedBytes, setSavedBytes] = useState<number | null>(null);

  async function handleCompress() {
    if (!file) {
      setError("Please upload a PDF file first.");
      return;
    }

    setError("");
    setIsProcessing(true);
    setResultSize(null);
    setSavedBytes(null);

    try {
      const bytes = await file.arrayBuffer();
      const pdf = await PDFDocument.load(bytes);

      const saveOptions =
        mode === "strong"
          ? {
              useObjectStreams: true,
              addDefaultPage: false,
              updateFieldAppearances: false,
            }
          : {
              useObjectStreams: true,
              addDefaultPage: false,
            };

      const compressedBytes = await pdf.save(saveOptions);
      const output = new Uint8Array(compressedBytes);
      const blob = new Blob([output], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      setResultSize(blob.size);
      setSavedBytes(Math.max(0, file.size - blob.size));

      const a = document.createElement("a");
      a.href = url;
      a.download = `${file.name.replace(/\.pdf$/i, "") || "document"}-compressed.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      setError("Failed to compress PDF. Try another file or a smaller document.");
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <section className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
      <div className="rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-6">
        <h2 className="text-xl font-semibold sm:text-2xl">Compress PDF</h2>
        <p className="mt-2 text-sm text-muted">
          Reduce PDF file size in your browser for faster uploads, emails, and sharing.
        </p>

        <label className="mt-4 block rounded-2xl border border-dashed border-line bg-white p-4 text-sm text-muted">
          <span className="font-semibold text-foreground">Upload PDF</span>
          <input
            type="file"
            accept="application/pdf,.pdf"
            className="mt-3 block w-full text-sm"
            onChange={(event) => {
              setFile(event.target.files?.[0] ?? null);
              setError("");
              setResultSize(null);
              setSavedBytes(null);
            }}
          />
          {file ? <span className="mt-2 block text-xs text-foreground">Loaded: {file.name}</span> : null}
        </label>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setMode("balanced")}
            className={`rounded-xl border px-4 py-3 text-left text-sm font-semibold transition ${
              mode === "balanced"
                ? "border-brand bg-brand/10 text-brand"
                : "border-line bg-white text-foreground hover:border-brand"
            }`}
          >
            Balanced Compression
          </button>
          <button
            type="button"
            onClick={() => setMode("strong")}
            className={`rounded-xl border px-4 py-3 text-left text-sm font-semibold transition ${
              mode === "strong"
                ? "border-brand bg-brand/10 text-brand"
                : "border-line bg-white text-foreground hover:border-brand"
            }`}
          >
            Strong Compression
          </button>
        </div>

        <button
          type="button"
          onClick={() => void handleCompress()}
          disabled={!file || isProcessing}
          className="mt-4 rounded-xl border border-brand bg-brand px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isProcessing ? "Compressing..." : "Compress and Download"}
        </button>

        {error ? <p className="mt-3 text-sm font-semibold text-rose-700">{error}</p> : null}
      </div>

      <div className="grid gap-3">
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Original Size</p>
          <p className="mt-2 text-3xl font-bold">{file ? formatBytes(file.size) : "-"}</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Compressed Size</p>
          <p className="mt-2 text-3xl font-bold">{resultSize ? formatBytes(resultSize) : "-"}</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Space Saved</p>
          <p className="mt-2 text-3xl font-bold">{savedBytes !== null ? formatBytes(savedBytes) : "-"}</p>
          <p className="mt-1 text-xs text-muted">
            Note: PDFs with already-optimized images may show smaller reductions.
          </p>
        </article>
      </div>
    </section>
  );
}
