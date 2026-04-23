"use client";

import { useMemo, useState } from "react";
import { PDFDocument } from "pdf-lib";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

type PdfItem = {
  id: string;
  file: File;
};

export function MergePdfTool() {
  const [items, setItems] = useState<PdfItem[]>([]);
  const [isMerging, setIsMerging] = useState(false);
  const [error, setError] = useState("");

  const totalSize = useMemo(
    () => items.reduce((sum, item) => sum + item.file.size, 0),
    [items],
  );

  function addFiles(fileList: FileList | null) {
    if (!fileList) return;
    const next = [...fileList]
      .filter((file) => file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf"))
      .map((file) => ({ id: `${file.name}-${file.size}-${crypto.randomUUID()}`, file }));
    if (!next.length) return;
    setItems((prev) => [...prev, ...next]);
    setError("");
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  function moveItem(id: string, direction: -1 | 1) {
    setItems((prev) => {
      const idx = prev.findIndex((item) => item.id === id);
      const target = idx + direction;
      if (idx < 0 || target < 0 || target >= prev.length) return prev;
      const copy = [...prev];
      [copy[idx], copy[target]] = [copy[target], copy[idx]];
      return copy;
    });
  }

  async function handleMerge() {
    if (items.length < 2) {
      setError("Please upload at least two PDF files.");
      return;
    }

    try {
      setIsMerging(true);
      setError("");
      const merged = await PDFDocument.create();

      for (const item of items) {
        const bytes = await item.file.arrayBuffer();
        const src = await PDFDocument.load(bytes);
        const copiedPages = await merged.copyPages(src, src.getPageIndices());
        copiedPages.forEach((page) => merged.addPage(page));
      }

      const mergedBytes = await merged.save();
      const safeBytes = new Uint8Array(mergedBytes);
      const blob = new Blob([safeBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "merged.pdf";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Failed to merge PDFs. Please try different files.");
    } finally {
      setIsMerging(false);
    }
  }

  return (
    <section className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
      <div className="rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-6">
        <h2 className="text-xl font-semibold sm:text-2xl">Merge PDF</h2>
        <p className="mt-2 text-sm text-muted">Upload multiple PDFs, reorder them, and merge into one file.</p>

        <label className="mt-4 block rounded-2xl border border-dashed border-line bg-white p-4 text-sm text-muted">
          <span className="font-semibold text-foreground">Upload PDF files</span>
          <input
            type="file"
            accept="application/pdf,.pdf"
            multiple
            className="mt-3 block w-full text-sm"
            onChange={(event) => addFiles(event.target.files)}
          />
        </label>

        {error ? <p className="mt-3 text-sm font-semibold text-rose-700">{error}</p> : null}

        <div className="mt-4 space-y-2">
          {items.map((item, index) => (
            <div key={item.id} className="flex items-center justify-between gap-2 rounded-xl border border-line bg-white p-3 text-sm">
              <div className="min-w-0">
                <p className="truncate font-semibold text-foreground">{index + 1}. {item.file.name}</p>
                <p className="text-xs text-muted">{formatBytes(item.file.size)}</p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => moveItem(item.id, -1)}
                  className="rounded-md border border-line px-2 py-1 text-xs font-semibold text-muted transition hover:border-brand hover:text-brand"
                >
                  Up
                </button>
                <button
                  type="button"
                  onClick={() => moveItem(item.id, 1)}
                  className="rounded-md border border-line px-2 py-1 text-xs font-semibold text-muted transition hover:border-brand hover:text-brand"
                >
                  Down
                </button>
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="rounded-md border border-rose-200 px-2 py-1 text-xs font-semibold text-rose-700 transition hover:bg-rose-50"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-3">
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Files Added</p>
          <p className="mt-2 text-3xl font-bold">{items.length}</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Total Size</p>
          <p className="mt-2 text-3xl font-bold">{formatBytes(totalSize)}</p>
        </article>
        <button
          type="button"
          onClick={() => void handleMerge()}
          disabled={isMerging || items.length < 2}
          className="rounded-xl border border-brand bg-brand px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isMerging ? "Merging..." : "Merge and Download"}
        </button>
        <p className="text-xs text-muted">
          Privacy-friendly: merge happens in your browser, files are not uploaded to our server.
        </p>
      </div>
    </section>
  );
}
