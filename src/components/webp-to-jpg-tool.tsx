"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

type OutputFormat = "image/jpeg" | "image/png";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(2)} MB`;
}

export function WebpToJpgTool() {
  const [file, setFile] = useState<File | null>(null);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("image/jpeg");
  const [quality, setQuality] = useState(0.9);
  const [background, setBackground] = useState("#ffffff");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [inputUrl, setInputUrl] = useState("");
  const [outputBlob, setOutputBlob] = useState<Blob | null>(null);
  const [outputUrl, setOutputUrl] = useState("");

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

  async function convert() {
    if (!file) {
      setError("Please upload a WebP image first.");
      return;
    }
    setError("");
    setIsProcessing(true);
    try {
      const src = URL.createObjectURL(file);
      const img = new window.Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Unable to load WebP image."));
        img.src = src;
      });

      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(src);
        throw new Error("Canvas unavailable.");
      }

      if (outputFormat === "image/jpeg") {
        ctx.fillStyle = background;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(img, 0, 0);

      const blob = await new Promise<Blob | null>((resolve) => {
        if (outputFormat === "image/png") {
          canvas.toBlob(resolve, outputFormat);
          return;
        }
        canvas.toBlob(resolve, outputFormat, quality);
      });
      URL.revokeObjectURL(src);
      if (!blob) throw new Error("Conversion failed.");
      setOutputBlob(blob);
    } catch (e) {
      setOutputBlob(null);
      setError(e instanceof Error ? e.message : "Conversion failed.");
    } finally {
      setIsProcessing(false);
    }
  }

  function download() {
    if (!outputBlob || !outputUrl || !file) return;
    const base = file.name.replace(/\.[^/.]+$/, "");
    const ext = outputBlob.type === "image/png" ? "png" : "jpg";
    const a = document.createElement("a");
    a.href = outputUrl;
    a.download = `${base}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  return (
    <section className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
      <div className="rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-6">
        <h2 className="text-xl font-semibold sm:text-2xl">WebP to JPG / PNG</h2>
        <p className="mt-2 text-sm text-muted">
          Convert WebP files to JPG for compatibility or PNG for transparent output.
        </p>

        <label className="mt-4 grid gap-2">
          <span className="text-sm font-semibold text-foreground">Upload WebP</span>
          <input
            type="file"
            accept="image/webp,.webp"
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
            <span className="text-sm font-semibold text-foreground">Output Format</span>
            <select
              value={outputFormat}
              onChange={(event) => setOutputFormat(event.target.value as OutputFormat)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            >
              <option value="image/jpeg">JPG</option>
              <option value="image/png">PNG</option>
            </select>
          </label>
          {outputFormat === "image/jpeg" ? (
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-foreground">JPG Quality ({Math.round(quality * 100)}%)</span>
              <input
                type="range"
                min={50}
                max={98}
                value={Math.round(quality * 100)}
                onChange={(event) => setQuality(Number(event.target.value) / 100)}
              />
            </label>
          ) : (
            <div />
          )}
        </div>

        {outputFormat === "image/jpeg" ? (
          <label className="mt-3 grid gap-2 sm:max-w-xs">
            <span className="text-sm font-semibold text-foreground">Background (for transparency)</span>
            <input
              type="color"
              value={background}
              onChange={(event) => setBackground(event.target.value)}
              className="h-10 w-full rounded-lg border border-line bg-white p-1"
            />
          </label>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void convert()}
            disabled={!file || isProcessing}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isProcessing ? "Converting..." : "Convert"}
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

        {error ? <p className="mt-3 text-sm font-semibold text-red-600">{error}</p> : null}
      </div>

      <div className="grid gap-3">
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Preview</p>
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            <div>
              <p className="mb-1 text-xs font-semibold text-muted">Input WebP</p>
              <div className="overflow-hidden rounded-lg border border-line bg-white">
                {inputUrl ? (
                  <Image
                    src={inputUrl}
                    alt="Input preview"
                    width={640}
                    height={360}
                    unoptimized
                    className="h-28 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-28 items-center justify-center text-xs text-muted">No image</div>
                )}
              </div>
            </div>
            <div>
              <p className="mb-1 text-xs font-semibold text-muted">Output</p>
              <div className="overflow-hidden rounded-lg border border-line bg-white">
                {outputUrl ? (
                  <Image
                    src={outputUrl}
                    alt="Output preview"
                    width={640}
                    height={360}
                    unoptimized
                    className="h-28 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-28 items-center justify-center text-xs text-muted">No output</div>
                )}
              </div>
            </div>
          </div>
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
            <p className="mt-2 text-sm text-muted">Convert to see output statistics.</p>
          )}
        </article>
      </div>
    </section>
  );
}

