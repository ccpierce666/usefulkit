"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

type OutputFormat = "image/jpeg" | "image/png" | "image/webp";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(2)} MB`;
}

function extByMime(mime: string): string {
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  return "img";
}

function resizeToLimit(width: number, height: number, maxSide = 2200) {
  const longSide = Math.max(width, height);
  if (longSide <= maxSide) return { width, height };
  const scale = maxSide / longSide;
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

export function ImageMosaicTool() {
  const [file, setFile] = useState<File | null>(null);
  const [inputUrl, setInputUrl] = useState("");
  const [outputBlob, setOutputBlob] = useState<Blob | null>(null);
  const [outputUrl, setOutputUrl] = useState("");
  const [blockSize, setBlockSize] = useState(18);
  const [quality, setQuality] = useState(0.9);
  const [format, setFormat] = useState<OutputFormat>("image/jpeg");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!file) {
      setInputUrl("");
      return;
    }
    const url = URL.createObjectURL(file);
    setInputUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    if (!outputBlob) {
      setOutputUrl("");
      return;
    }
    const url = URL.createObjectURL(outputBlob);
    setOutputUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [outputBlob]);

  const stats = useMemo(() => {
    if (!file || !outputBlob) return null;
    const delta = outputBlob.size - file.size;
    const ratio = file.size > 0 ? (delta / file.size) * 100 : 0;
    return { input: file.size, output: outputBlob.size, delta, ratio };
  }, [file, outputBlob]);

  async function generateMosaic() {
    if (!file) {
      setError("Please choose an image first.");
      return;
    }
    setError("");
    setIsProcessing(true);
    try {
      const sourceUrl = URL.createObjectURL(file);
      const image = new window.Image();
      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject(new Error("Failed to load source image."));
        image.src = sourceUrl;
      });

      const safeSize = resizeToLimit(image.naturalWidth, image.naturalHeight);
      const canvas = document.createElement("canvas");
      canvas.width = safeSize.width;
      canvas.height = safeSize.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(sourceUrl);
        throw new Error("Canvas is not available.");
      }

      ctx.drawImage(image, 0, 0, safeSize.width, safeSize.height);

      const scaledW = Math.max(1, Math.floor(safeSize.width / blockSize));
      const scaledH = Math.max(1, Math.floor(safeSize.height / blockSize));

      const pixelCanvas = document.createElement("canvas");
      pixelCanvas.width = scaledW;
      pixelCanvas.height = scaledH;
      const pixelCtx = pixelCanvas.getContext("2d");
      if (!pixelCtx) {
        URL.revokeObjectURL(sourceUrl);
        throw new Error("Pixel canvas is not available.");
      }

      pixelCtx.imageSmoothingEnabled = true;
      pixelCtx.drawImage(canvas, 0, 0, scaledW, scaledH);

      ctx.clearRect(0, 0, safeSize.width, safeSize.height);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(pixelCanvas, 0, 0, scaledW, scaledH, 0, 0, safeSize.width, safeSize.height);
      ctx.imageSmoothingEnabled = true;

      const blob = await new Promise<Blob | null>((resolve) => {
        if (format === "image/png") {
          canvas.toBlob(resolve, format);
          return;
        }
        canvas.toBlob(resolve, format, quality);
      });
      URL.revokeObjectURL(sourceUrl);
      if (!blob) throw new Error("Failed to generate mosaic output.");
      setOutputBlob(blob);
    } catch (e) {
      setOutputBlob(null);
      setError(e instanceof Error ? e.message : "Mosaic generation failed.");
    } finally {
      setIsProcessing(false);
    }
  }

  function downloadResult() {
    if (!outputBlob || !outputUrl || !file) return;
    const base = file.name.replace(/\.[^/.]+$/, "");
    const ext = extByMime(outputBlob.type || format);
    const a = document.createElement("a");
    a.href = outputUrl;
    a.download = `${base}-mosaic.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  return (
    <section className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
      <div className="rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-6">
        <h2 className="text-xl font-semibold sm:text-2xl">Image Mosaic</h2>
        <p className="mt-2 text-sm text-muted">
          Apply full-image mosaic effect with adjustable pixel block size.
        </p>

        <label className="mt-4 grid gap-2">
          <span className="text-sm font-semibold text-foreground">Upload Image</span>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(event) => {
              setFile(event.target.files?.[0] ?? null);
              setOutputBlob(null);
            }}
            className="h-11 rounded-xl border border-line bg-white px-3 py-2 text-sm outline-none"
          />
        </label>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-foreground">Block Size ({blockSize}px)</span>
            <input
              type="range"
              min={4}
              max={80}
              value={blockSize}
              onChange={(event) => setBlockSize(Number(event.target.value))}
            />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-foreground">Output Format</span>
            <select
              value={format}
              onChange={(event) => setFormat(event.target.value as OutputFormat)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            >
              <option value="image/jpeg">JPG</option>
              <option value="image/png">PNG</option>
              <option value="image/webp">WebP</option>
            </select>
          </label>
        </div>

        {format !== "image/png" ? (
          <label className="mt-3 grid gap-2">
            <span className="text-sm font-semibold text-foreground">Quality ({Math.round(quality * 100)}%)</span>
            <input
              type="range"
              min={50}
              max={95}
              value={Math.round(quality * 100)}
              onChange={(event) => setQuality(Number(event.target.value) / 100)}
            />
          </label>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void generateMosaic()}
            disabled={!file || isProcessing}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isProcessing ? "Generating..." : "Generate Mosaic"}
          </button>
          <button
            type="button"
            onClick={downloadResult}
            disabled={!outputBlob}
            className="rounded-lg border border-line px-4 py-2 text-sm font-semibold text-muted transition hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-50"
          >
            Download
          </button>
        </div>
        {error ? <p className="mt-3 text-sm font-semibold text-red-600">{error}</p> : null}
      </div>

      <div className="grid gap-3">
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Mosaic Strength</p>
          <p className="mt-2 text-3xl font-bold">{blockSize}</p>
          <p className="mt-1 text-xs text-muted">
            Larger block size creates stronger censorship-style mosaic.
          </p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Result</p>
          {stats ? (
            <div className="mt-2 text-sm">
              <p>Input: {formatBytes(stats.input)}</p>
              <p>Output: {formatBytes(stats.output)}</p>
              <p className={`font-semibold ${stats.delta <= 0 ? "text-brand" : "text-amber-600"}`}>
                Size change: {stats.delta > 0 ? "+" : ""}
                {formatBytes(stats.delta)} ({stats.ratio > 0 ? "+" : ""}
                {stats.ratio.toFixed(1)}%)
              </p>
            </div>
          ) : (
            <p className="mt-2 text-sm text-muted">Generate output to view file-size comparison.</p>
          )}
        </article>
      </div>

      {(inputUrl || outputUrl) ? (
        <div className="lg:col-span-2 grid gap-4 lg:grid-cols-2">
          <article className="rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-6">
            <h3 className="text-lg font-semibold sm:text-xl">Original</h3>
            <div className="mt-3 overflow-hidden rounded-2xl border border-line bg-white">
              {inputUrl ? (
                <Image
                  src={inputUrl}
                  alt="Image before mosaic"
                  width={1200}
                  height={900}
                  unoptimized
                  className="h-auto w-full"
                />
              ) : (
                <div className="p-6 text-sm text-muted">Upload image to preview.</div>
              )}
            </div>
          </article>
          <article className="rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-6">
            <h3 className="text-lg font-semibold sm:text-xl">Mosaic Output</h3>
            <div className="mt-3 overflow-hidden rounded-2xl border border-line bg-white">
              {outputUrl ? (
                <Image
                  src={outputUrl}
                  alt="Image with mosaic effect"
                  width={1200}
                  height={900}
                  unoptimized
                  className="h-auto w-full"
                />
              ) : (
                <div className="p-6 text-sm text-muted">Generate mosaic to preview result.</div>
              )}
            </div>
          </article>
        </div>
      ) : null}
    </section>
  );
}

