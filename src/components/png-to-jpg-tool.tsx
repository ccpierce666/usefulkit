"use client";

import { useEffect, useMemo, useState } from "react";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(2)} MB`;
}

export function PngToJpgTool() {
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState(0.86);
  const [bgColor, setBgColor] = useState("#ffffff");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [outputBlob, setOutputBlob] = useState<Blob | null>(null);
  const [outputUrl, setOutputUrl] = useState("");

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
    const saved = file.size - outputBlob.size;
    const ratio = file.size > 0 ? (saved / file.size) * 100 : 0;
    return {
      input: file.size,
      output: outputBlob.size,
      saved,
      ratio,
    };
  }, [file, outputBlob]);

  const convert = async () => {
    if (!file) {
      setError("Please choose a PNG file first.");
      return;
    }
    setError("");
    setIsProcessing(true);
    try {
      const src = URL.createObjectURL(file);
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Unable to load PNG image."));
        img.src = src;
      });

      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(src);
        throw new Error("Canvas is not available in this browser.");
      }
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", quality),
      );
      URL.revokeObjectURL(src);
      if (!blob) {
        throw new Error("Conversion failed.");
      }
      setOutputBlob(blob);
    } catch (e) {
      setOutputBlob(null);
      setError(e instanceof Error ? e.message : "Conversion failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  const download = () => {
    if (!outputUrl || !file) return;
    const base = file.name.replace(/\.png$/i, "");
    const a = document.createElement("a");
    a.href = outputUrl;
    a.download = `${base}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <section className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
      <div className="rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-6">
        <h2 className="text-xl font-semibold sm:text-2xl">PNG to JPG Converter</h2>
        <p className="mt-2 text-sm text-muted">Convert PNG images to JPG with quality and background control.</p>

        <label className="mt-4 grid gap-2">
          <span className="text-sm font-semibold text-foreground">Upload PNG</span>
          <input
            type="file"
            accept="image/png"
            onChange={(event) => {
              const next = event.target.files?.[0] ?? null;
              setFile(next);
              setOutputBlob(null);
            }}
            className="h-11 rounded-xl border border-line bg-white px-3 py-2 text-sm outline-none"
          />
        </label>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-foreground">JPG Quality ({Math.round(quality * 100)}%)</span>
            <input
              type="range"
              min={40}
              max={95}
              value={Math.round(quality * 100)}
              onChange={(event) => setQuality(Number(event.target.value) / 100)}
            />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-foreground">Background Color</span>
            <input
              type="color"
              value={bgColor}
              onChange={(event) => setBgColor(event.target.value)}
              className="h-10 w-full rounded-lg border border-line bg-white p-1"
            />
          </label>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={convert}
            disabled={!file || isProcessing}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isProcessing ? "Converting..." : "Convert to JPG"}
          </button>
          <button
            type="button"
            onClick={download}
            disabled={!outputBlob}
            className="rounded-lg border border-line px-4 py-2 text-sm font-semibold text-muted transition hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-50"
          >
            Download JPG
          </button>
        </div>
        {error ? <p className="mt-3 text-sm font-semibold text-red-600">{error}</p> : null}
      </div>

      <div className="grid gap-3">
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Preview</p>
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            <div>
              <p className="mb-1 text-xs font-semibold text-muted">PNG Input</p>
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previewUrl} alt="PNG preview" className="h-28 w-full rounded-lg border border-line object-cover" />
              ) : (
                <div className="flex h-28 items-center justify-center rounded-lg border border-dashed border-line text-xs text-muted">
                  No image
                </div>
              )}
            </div>
            <div>
              <p className="mb-1 text-xs font-semibold text-muted">JPG Output</p>
              {outputUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={outputUrl} alt="JPG preview" className="h-28 w-full rounded-lg border border-line object-cover" />
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
          {stats ? (
            <div className="mt-2 text-sm">
              <p>Input PNG: {formatBytes(stats.input)}</p>
              <p>Output JPG: {formatBytes(stats.output)}</p>
              <p className="font-semibold text-brand">
                Saved: {formatBytes(stats.saved)} ({stats.ratio.toFixed(1)}%)
              </p>
            </div>
          ) : (
            <p className="mt-2 text-sm text-muted">Convert to see final size and savings.</p>
          )}
        </article>
      </div>
    </section>
  );
}
