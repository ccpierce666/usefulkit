"use client";

import { useMemo, useState } from "react";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function PdfToTextTool() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [text, setText] = useState("");
  const [pageCount, setPageCount] = useState(0);

  const stats = useMemo(() => {
    const trimmed = text.trim();
    if (!trimmed) {
      return { characters: 0, words: 0, lines: 0 };
    }

    return {
      characters: trimmed.length,
      words: trimmed.split(/\s+/).filter(Boolean).length,
      lines: trimmed.split(/\n/).length,
    };
  }, [text]);

  async function handleFile(nextFile: File) {
    setFile(nextFile);
    setError("");
    setText("");
    setPageCount(0);
    setIsProcessing(true);

    try {
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/build/pdf.worker.mjs",
        import.meta.url,
      ).toString();

      const bytes = await nextFile.arrayBuffer();
      const loadingTask = pdfjs.getDocument({ data: bytes });
      const pdf = await loadingTask.promise;
      setPageCount(pdf.numPages);

      const pageTexts: string[] = [];
      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
        const page = await pdf.getPage(pageNumber);
        const content = await page.getTextContent();
        const tokens = content.items
          .map((item) => ("str" in item ? item.str : ""))
          .filter(Boolean);
        pageTexts.push(tokens.join(" "));
      }

      setText(pageTexts.join("\n\n"));
    } catch {
      setError("Failed to extract text from this PDF. Try a text-based PDF instead of a scanned image.");
    } finally {
      setIsProcessing(false);
    }
  }

  async function copyText() {
    if (!text) return;
    await navigator.clipboard.writeText(text);
  }

  function downloadText() {
    if (!text || !file) return;
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${file.name.replace(/\.pdf$/i, "") || "document"}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <section className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
      <div className="rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-6">
        <h2 className="text-xl font-semibold sm:text-2xl">PDF to Text</h2>
        <p className="mt-2 text-sm text-muted">
          Extract readable text from a PDF in your browser and copy or download it as plain text.
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

        {error ? <p className="mt-3 text-sm font-semibold text-rose-700">{error}</p> : null}

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void copyText()}
            disabled={!text}
            className="rounded-xl border border-line bg-white px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Copy Text
          </button>
          <button
            type="button"
            onClick={downloadText}
            disabled={!text}
            className="rounded-xl border border-brand bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-50"
          >
            Download TXT
          </button>
          <p className="self-center text-xs text-muted">
            {isProcessing ? "Extracting text..." : "Best for text-based PDFs, not scanned image PDFs."}
          </p>
        </div>

        <label className="mt-4 block">
          <span className="text-sm font-semibold text-foreground">Extracted Text</span>
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Extracted text will appear here."
            className="mt-2 min-h-[320px] w-full rounded-2xl border border-line bg-white p-3 text-sm outline-none transition focus:border-brand"
          />
        </label>
      </div>

      <div className="grid gap-3">
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">File Size</p>
          <p className="mt-2 text-3xl font-bold">{file ? formatBytes(file.size) : "-"}</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Pages</p>
          <p className="mt-2 text-3xl font-bold">{pageCount || "-"}</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Words</p>
          <p className="mt-2 text-3xl font-bold">{stats.words || "-"}</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Characters</p>
          <p className="mt-2 text-3xl font-bold">{stats.characters || "-"}</p>
          <p className="mt-1 text-xs text-muted">{stats.lines || 0} lines of extracted text.</p>
        </article>
      </div>
    </section>
  );
}
