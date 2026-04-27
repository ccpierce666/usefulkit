"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

type OutputFormat = "image/png" | "image/webp";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(2)} MB`;
}

function colorDistance(r1: number, g1: number, b1: number, r2: number, g2: number, b2: number) {
  const dr = r1 - r2;
  const dg = g1 - g2;
  const db = b1 - b2;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

function averagePatch(
  data: Uint8ClampedArray,
  width: number,
  xStart: number,
  xEnd: number,
  yStart: number,
  yEnd: number,
) {
  let r = 0;
  let g = 0;
  let b = 0;
  let count = 0;
  for (let y = yStart; y < yEnd; y += 1) {
    for (let x = xStart; x < xEnd; x += 1) {
      const idx = (y * width + x) * 4;
      r += data[idx];
      g += data[idx + 1];
      b += data[idx + 2];
      count += 1;
    }
  }
  return {
    r: Math.round(r / Math.max(1, count)),
    g: Math.round(g / Math.max(1, count)),
    b: Math.round(b / Math.max(1, count)),
  };
}

function resizeToLimit(width: number, height: number, maxSide = 2400) {
  const longSide = Math.max(width, height);
  if (longSide <= maxSide) return { width, height };
  const scale = maxSide / longSide;
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

export function RemoveBackgroundTool() {
  const [file, setFile] = useState<File | null>(null);
  const [inputUrl, setInputUrl] = useState("");
  const [outputBlob, setOutputBlob] = useState<Blob | null>(null);
  const [outputUrl, setOutputUrl] = useState("");
  const [threshold, setThreshold] = useState(42);
  const [softness, setSoftness] = useState(24);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("image/png");
  const [quality, setQuality] = useState(0.92);
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

  async function removeBackground() {
    if (!file) {
      setError("Please upload an image first.");
      return;
    }
    setError("");
    setIsProcessing(true);
    try {
      const sourceUrl = URL.createObjectURL(file);
      const image = new window.Image();
      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject(new Error("Unable to load image."));
        image.src = sourceUrl;
      });

      const safeSize = resizeToLimit(image.naturalWidth, image.naturalHeight);
      const canvas = document.createElement("canvas");
      canvas.width = safeSize.width;
      canvas.height = safeSize.height;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) {
        URL.revokeObjectURL(sourceUrl);
        throw new Error("Canvas unavailable.");
      }
      ctx.drawImage(image, 0, 0, safeSize.width, safeSize.height);

      const imageData = ctx.getImageData(0, 0, safeSize.width, safeSize.height);
      const { data, width, height } = imageData;

      const patchSize = Math.max(8, Math.round(Math.min(width, height) * 0.05));
      const topLeft = averagePatch(data, width, 0, patchSize, 0, patchSize);
      const topRight = averagePatch(data, width, width - patchSize, width, 0, patchSize);
      const bottomLeft = averagePatch(data, width, 0, patchSize, height - patchSize, height);
      const bottomRight = averagePatch(data, width, width - patchSize, width, height - patchSize, height);
      const corners = [topLeft, topRight, bottomLeft, bottomRight];

      const softRange = Math.max(1, softness);
      const hardCut = Math.max(1, threshold - softRange);
      const fadeEnd = threshold + softRange;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const originalAlpha = data[i + 3];

        let nearest = Number.POSITIVE_INFINITY;
        for (const corner of corners) {
          const distance = colorDistance(r, g, b, corner.r, corner.g, corner.b);
          if (distance < nearest) nearest = distance;
        }

        let targetAlpha = 255;
        if (nearest <= hardCut) {
          targetAlpha = 0;
        } else if (nearest < fadeEnd) {
          const ratio = (nearest - hardCut) / (fadeEnd - hardCut);
          targetAlpha = Math.round(255 * ratio);
        }

        data[i + 3] = Math.round((originalAlpha / 255) * targetAlpha);
      }

      ctx.putImageData(imageData, 0, 0);

      const blob = await new Promise<Blob | null>((resolve) => {
        if (outputFormat === "image/png") {
          canvas.toBlob(resolve, "image/png");
          return;
        }
        canvas.toBlob(resolve, "image/webp", quality);
      });
      URL.revokeObjectURL(sourceUrl);
      if (!blob) throw new Error("Background removal failed.");
      setOutputBlob(blob);
    } catch (e) {
      setOutputBlob(null);
      setError(e instanceof Error ? e.message : "Background removal failed.");
    } finally {
      setIsProcessing(false);
    }
  }

  function download() {
    if (!outputBlob || !outputUrl || !file) return;
    const base = file.name.replace(/\.[^/.]+$/, "");
    const ext = outputBlob.type === "image/webp" ? "webp" : "png";
    const anchor = document.createElement("a");
    anchor.href = outputUrl;
    anchor.download = `${base}-no-bg.${ext}`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  }

  return (
    <section className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
      <div className="rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-6">
        <h2 className="text-xl font-semibold sm:text-2xl">Remove Background</h2>
        <p className="mt-2 text-sm text-muted">
          Automatically remove solid or near-solid backgrounds and export transparent PNG/WebP.
        </p>

        <label className="mt-4 grid gap-2">
          <span className="text-sm font-semibold text-foreground">Upload Image</span>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(event) => {
              setFile(event.target.files?.[0] ?? null);
              setOutputBlob(null);
              setError("");
            }}
            className="h-11 rounded-xl border border-line bg-white px-3 py-2 text-sm outline-none"
          />
        </label>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-foreground">Detection Threshold ({threshold})</span>
            <input
              type="range"
              min={12}
              max={120}
              value={threshold}
              onChange={(event) => setThreshold(Number(event.target.value))}
            />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-foreground">Edge Softness ({softness})</span>
            <input
              type="range"
              min={0}
              max={80}
              value={softness}
              onChange={(event) => setSoftness(Number(event.target.value))}
            />
          </label>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-foreground">Output Format</span>
            <select
              value={outputFormat}
              onChange={(event) => setOutputFormat(event.target.value as OutputFormat)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            >
              <option value="image/png">PNG (recommended)</option>
              <option value="image/webp">WebP</option>
            </select>
          </label>
          {outputFormat === "image/webp" ? (
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-foreground">WebP Quality ({Math.round(quality * 100)}%)</span>
              <input
                type="range"
                min={60}
                max={98}
                value={Math.round(quality * 100)}
                onChange={(event) => setQuality(Number(event.target.value) / 100)}
              />
            </label>
          ) : (
            <div />
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void removeBackground()}
            disabled={!file || isProcessing}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isProcessing ? "Removing..." : "Remove Background"}
          </button>
          <button
            type="button"
            onClick={download}
            disabled={!outputBlob}
            className="rounded-lg border border-line px-4 py-2 text-sm font-semibold text-muted transition hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-50"
          >
            Download
          </button>
        </div>

        <p className="mt-3 text-xs text-muted">
          Tip: This fast MVP works best when subject and background colors are clearly different.
        </p>
        {error ? <p className="mt-2 text-sm font-semibold text-red-600">{error}</p> : null}
      </div>

      <div className="grid gap-3">
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
            <p className="mt-2 text-sm text-muted">Run removal to see result statistics.</p>
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
                  alt="Original image"
                  width={1200}
                  height={900}
                  unoptimized
                  className="h-auto w-full"
                />
              ) : (
                <div className="p-6 text-sm text-muted">No image uploaded.</div>
              )}
            </div>
          </article>
          <article className="rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-6">
            <h3 className="text-lg font-semibold sm:text-xl">Background Removed</h3>
            <div
              className="mt-3 overflow-hidden rounded-2xl border border-line"
              style={{
                backgroundImage:
                  "linear-gradient(45deg, #f5f5f5 25%, transparent 25%), linear-gradient(-45deg, #f5f5f5 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f5f5f5 75%), linear-gradient(-45deg, transparent 75%, #f5f5f5 75%)",
                backgroundSize: "20px 20px",
                backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
              }}
            >
              {outputUrl ? (
                <Image
                  src={outputUrl}
                  alt="Background removed result"
                  width={1200}
                  height={900}
                  unoptimized
                  className="h-auto w-full"
                />
              ) : (
                <div className="p-6 text-sm text-muted">No output yet.</div>
              )}
            </div>
          </article>
        </div>
      ) : null}
    </section>
  );
}

