"use client";

import { useMemo, useState } from "react";

type RenderedPage = {
  pageNumber: number;
  url: string;
};

export function PdfToJpgTool() {
  const [fileName, setFileName] = useState("");
  const [isConverting, setIsConverting] = useState(false);
  const [quality, setQuality] = useState("0.9");
  const [pages, setPages] = useState<RenderedPage[]>([]);
  const [error, setError] = useState("");

  const pageCount = useMemo(() => pages.length, [pages]);

  function clearOldUrls() {
    setPages((prev) => {
      prev.forEach((item) => URL.revokeObjectURL(item.url));
      return [];
    });
  }

  async function handleFile(file: File) {
    setFileName(file.name);
    clearOldUrls();
    setError("");
    setIsConverting(true);

    try {
      const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
      const workerVersion = (pdfjsLib as { version?: string }).version ?? "4.10.38";
      pdfjsLib.GlobalWorkerOptions.workerSrc =
        `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${workerVersion}/pdf.worker.min.mjs`;

      const buffer = await file.arrayBuffer();
      const doc = await pdfjsLib.getDocument({ data: buffer }).promise;
      const nextPages: RenderedPage[] = [];
      const qualityNum = Math.min(1, Math.max(0.4, Number(quality) || 0.9));

      for (let i = 1; i <= doc.numPages; i += 1) {
        const page = await doc.getPage(i);
        const viewport = page.getViewport({ scale: 1.8 });
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) continue;

        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: ctx, canvas, viewport }).promise;

        const blob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob((value) => resolve(value), "image/jpeg", qualityNum),
        );
        if (!blob) continue;
        const url = URL.createObjectURL(blob);
        nextPages.push({ pageNumber: i, url });
      }

      setPages(nextPages);
      if (!nextPages.length) {
        setError("No pages converted. Please try another PDF.");
      }
    } catch {
      setError("Failed to convert PDF. Try a smaller file or another browser.");
    } finally {
      setIsConverting(false);
    }
  }

  return (
    <section className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
      <div className="rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-6">
        <h2 className="text-xl font-semibold sm:text-2xl">PDF to JPG</h2>
        <p className="mt-2 text-sm text-muted">Convert each PDF page into downloadable JPG images.</p>

        <label className="mt-4 block rounded-2xl border border-dashed border-line bg-white p-4 text-sm text-muted">
          <span className="font-semibold text-foreground">Upload PDF</span>
          <input
            type="file"
            accept="application/pdf,.pdf"
            className="mt-3 block w-full text-sm"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                void handleFile(file);
              }
            }}
          />
          {fileName ? <span className="mt-2 block text-xs text-foreground">Loaded: {fileName}</span> : null}
        </label>

        <label className="mt-4 grid gap-1">
          <span className="text-sm font-semibold text-foreground">JPG Quality</span>
          <input
            type="range"
            min="0.4"
            max="1"
            step="0.05"
            value={quality}
            onChange={(event) => setQuality(event.target.value)}
            className="w-full"
          />
          <span className="text-xs text-muted">{Number(quality).toFixed(2)}</span>
        </label>

        {error ? <p className="mt-3 text-sm font-semibold text-rose-700">{error}</p> : null}
      </div>

      <div className="grid gap-3">
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Converted Pages</p>
          <p className="mt-2 text-3xl font-bold">{pageCount}</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Status</p>
          <p className="mt-2 text-base font-semibold text-foreground">
            {isConverting ? "Converting..." : pageCount > 0 ? "Ready to download" : "Waiting for PDF upload"}
          </p>
        </article>
      </div>

      {pages.length > 0 ? (
        <div className="lg:col-span-2 rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-6">
          <h3 className="text-lg font-semibold sm:text-xl">JPG Output</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pages.map((item) => (
              <article key={item.pageNumber} className="rounded-2xl border border-line bg-white p-3">
                <p className="text-sm font-semibold">Page {item.pageNumber}</p>
                <img
                  src={item.url}
                  alt={`Converted page ${item.pageNumber}`}
                  className="mt-2 h-48 w-full rounded-lg border border-line object-contain"
                />
                <a
                  href={item.url}
                  download={`${fileName.replace(/\.pdf$/i, "") || "document"}-page-${item.pageNumber}.jpg`}
                  className="mt-3 inline-block rounded-md border border-line px-3 py-1.5 text-xs font-semibold text-muted transition hover:border-brand hover:text-brand"
                >
                  Download JPG
                </a>
              </article>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
