"use client";

import { useEffect, useMemo, useState } from "react";

type OutputFormat = "auto" | "image/jpeg" | "image/webp" | "image/png";

function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  const kb = bytes / 1024;
  if (kb < 1024) {
    return `${kb.toFixed(1)} KB`;
  }
  const mb = kb / 1024;
  return `${mb.toFixed(2)} MB`;
}

function extensionByMime(mime: string): string {
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/webp") return "webp";
  if (mime === "image/png") return "png";
  return "img";
}

export function ImageCompressorTool() {
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState(0.72);
  const [format, setFormat] = useState<OutputFormat>("auto");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [compressedUrl, setCompressedUrl] = useState("");

  useEffect(() => {
    if (!file) {
      setPreviewUrl("");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    if (!compressedBlob) {
      setCompressedUrl("");
      return;
    }
    const url = URL.createObjectURL(compressedBlob);
    setCompressedUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [compressedBlob]);

  const resultStats = useMemo(() => {
    if (!file || !compressedBlob) {
      return null;
    }
    const saved = file.size - compressedBlob.size;
    const percent = file.size > 0 ? (saved / file.size) * 100 : 0;
    return {
      original: file.size,
      compressed: compressedBlob.size,
      saved,
      percent,
    };
  }, [compressedBlob, file]);

  const runCompress = async () => {
    if (!file) {
      setError("Please choose an image first.");
      return;
    }
    setError("");
    setIsProcessing(true);

    try {
      const image = new Image();
      const sourceUrl = URL.createObjectURL(file);
      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject(new Error("Unable to load image."));
        image.src = sourceUrl;
      });

      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(sourceUrl);
        throw new Error("Canvas not available.");
      }
      ctx.drawImage(image, 0, 0);

      const targetMime = format === "auto" ? file.type || "image/jpeg" : format;
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, targetMime, quality),
      );
      URL.revokeObjectURL(sourceUrl);
      if (!blob) {
        throw new Error("Compression failed.");
      }
      setCompressedBlob(blob);
    } catch (e) {
      setCompressedBlob(null);
      setError(e instanceof Error ? e.message : "Compression failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  const download = () => {
    if (!compressedBlob || !file) return;
    const mime = compressedBlob.type || file.type || "image/jpeg";
    const ext = extensionByMime(mime);
    const baseName = file.name.replace(/\.[^/.]+$/, "");
    const anchor = document.createElement("a");
    anchor.href = compressedUrl;
    anchor.download = `${baseName}-compressed.${ext}`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  return (
    <section className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
      <div className="rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-6">
        <h2 className="text-xl font-semibold sm:text-2xl">Image Compressor</h2>
        <p className="mt-2 text-sm text-muted">Compress JPG, PNG, or WebP directly in your browser.</p>

        <label className="mt-4 grid gap-2">
          <span className="text-sm font-semibold text-foreground">Upload Image</span>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(event) => {
              const next = event.target.files?.[0] ?? null;
              setFile(next);
              setCompressedBlob(null);
            }}
            className="h-11 rounded-xl border border-line bg-white px-3 py-2 text-sm outline-none"
          />
        </label>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-foreground">Quality ({Math.round(quality * 100)}%)</span>
            <input
              type="range"
              min={20}
              max={95}
              value={Math.round(quality * 100)}
              onChange={(event) => setQuality(Number(event.target.value) / 100)}
            />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-foreground">Output Format</span>
            <select
              value={format}
              onChange={(event) => setFormat(event.target.value as OutputFormat)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            >
              <option value="auto">Keep Original</option>
              <option value="image/jpeg">JPG</option>
              <option value="image/webp">WebP</option>
              <option value="image/png">PNG</option>
            </select>
          </label>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={runCompress}
            disabled={!file || isProcessing}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isProcessing ? "Compressing..." : "Compress"}
          </button>
          <button
            type="button"
            onClick={download}
            disabled={!compressedBlob}
            className="rounded-lg border border-line px-4 py-2 text-sm font-semibold text-muted transition hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-50"
          >
            Download
          </button>
        </div>
        {error ? <p className="mt-3 text-sm font-semibold text-red-600">{error}</p> : null}
      </div>

      <div className="grid gap-3">
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Preview</p>
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            <div>
              <p className="mb-1 text-xs font-semibold text-muted">Original</p>
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previewUrl} alt="Original preview" className="h-28 w-full rounded-lg border border-line object-cover" />
              ) : (
                <div className="flex h-28 items-center justify-center rounded-lg border border-dashed border-line text-xs text-muted">
                  No image
                </div>
              )}
            </div>
            <div>
              <p className="mb-1 text-xs font-semibold text-muted">Compressed</p>
              {compressedUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={compressedUrl}
                  alt="Compressed preview"
                  className="h-28 w-full rounded-lg border border-line object-cover"
                />
              ) : (
                <div className="flex h-28 items-center justify-center rounded-lg border border-dashed border-line text-xs text-muted">
                  No output
                </div>
              )}
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Result</p>
          {resultStats ? (
            <div className="mt-2 text-sm">
              <p>Original: {formatBytes(resultStats.original)}</p>
              <p>Compressed: {formatBytes(resultStats.compressed)}</p>
              <p className="font-semibold text-brand">
                Saved: {formatBytes(resultStats.saved)} ({resultStats.percent.toFixed(1)}%)
              </p>
            </div>
          ) : (
            <p className="mt-2 text-sm text-muted">Upload and compress to see size comparison.</p>
          )}
        </article>
      </div>
    </section>
  );
}
