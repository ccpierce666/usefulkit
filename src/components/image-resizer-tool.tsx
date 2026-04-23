"use client";

import { useEffect, useMemo, useState } from "react";

type ResizeMode = "custom" | "instagram-square" | "instagram-story" | "youtube-thumb";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(2)} MB`;
}

function extByMime(mime: string, fallbackName: string): string {
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  const guess = fallbackName.split(".").pop();
  return guess || "img";
}

const PRESETS: Record<Exclude<ResizeMode, "custom">, { w: number; h: number; label: string }> = {
  "instagram-square": { w: 1080, h: 1080, label: "Instagram Square (1080x1080)" },
  "instagram-story": { w: 1080, h: 1920, label: "Instagram Story (1080x1920)" },
  "youtube-thumb": { w: 1280, h: 720, label: "YouTube Thumbnail (1280x720)" },
};

export function ImageResizerTool() {
  const [file, setFile] = useState<File | null>(null);
  const [inputUrl, setInputUrl] = useState("");
  const [outputBlob, setOutputBlob] = useState<Blob | null>(null);
  const [outputUrl, setOutputUrl] = useState("");
  const [naturalWidth, setNaturalWidth] = useState(0);
  const [naturalHeight, setNaturalHeight] = useState(0);
  const [width, setWidth] = useState(1200);
  const [height, setHeight] = useState(800);
  const [lockAspect, setLockAspect] = useState(true);
  const [mode, setMode] = useState<ResizeMode>("custom");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!file) {
      setInputUrl("");
      setNaturalWidth(0);
      setNaturalHeight(0);
      return;
    }
    const url = URL.createObjectURL(file);
    setInputUrl(url);
    const img = new Image();
    img.onload = () => {
      setNaturalWidth(img.naturalWidth);
      setNaturalHeight(img.naturalHeight);
      setWidth(img.naturalWidth);
      setHeight(img.naturalHeight);
    };
    img.src = url;
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

  const ratio = naturalWidth > 0 ? naturalHeight / naturalWidth : 1;

  const applyPreset = (nextMode: ResizeMode) => {
    setMode(nextMode);
    if (nextMode === "custom") return;
    const preset = PRESETS[nextMode];
    setWidth(preset.w);
    setHeight(preset.h);
    setLockAspect(false);
  };

  const onWidthChange = (value: number) => {
    const safe = Number.isFinite(value) ? Math.max(1, Math.floor(value)) : 1;
    setWidth(safe);
    if (lockAspect && naturalWidth > 0) {
      setHeight(Math.max(1, Math.round(safe * ratio)));
    }
  };

  const onHeightChange = (value: number) => {
    const safe = Number.isFinite(value) ? Math.max(1, Math.floor(value)) : 1;
    setHeight(safe);
    if (lockAspect && naturalHeight > 0) {
      setWidth(Math.max(1, Math.round(safe / ratio)));
    }
  };

  const resize = async () => {
    if (!file) {
      setError("Please upload an image first.");
      return;
    }
    setError("");
    setIsProcessing(true);
    try {
      const src = URL.createObjectURL(file);
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Unable to load image."));
        img.src = src;
      });

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(src);
        throw new Error("Canvas not available.");
      }
      ctx.drawImage(img, 0, 0, width, height);
      const mime = file.type || "image/jpeg";
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, mime, 0.9));
      URL.revokeObjectURL(src);
      if (!blob) throw new Error("Resize failed.");
      setOutputBlob(blob);
    } catch (e) {
      setOutputBlob(null);
      setError(e instanceof Error ? e.message : "Resize failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  const download = () => {
    if (!outputBlob || !outputUrl || !file) return;
    const base = file.name.replace(/\.[^/.]+$/, "");
    const ext = extByMime(outputBlob.type, file.name);
    const a = document.createElement("a");
    a.href = outputUrl;
    a.download = `${base}-${width}x${height}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <section className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
      <div className="rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-6">
        <h2 className="text-xl font-semibold sm:text-2xl">Image Resizer</h2>
        <p className="mt-2 text-sm text-muted">Resize images for social media, web, and ads.</p>

        <label className="mt-4 grid gap-2">
          <span className="text-sm font-semibold text-foreground">Upload Image</span>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(event) => {
              setFile(event.target.files?.[0] ?? null);
              setOutputBlob(null);
              setMode("custom");
            }}
            className="h-11 rounded-xl border border-line bg-white px-3 py-2 text-sm outline-none"
          />
        </label>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-foreground">Width (px)</span>
            <input
              type="number"
              min={1}
              value={width}
              onChange={(event) => onWidthChange(Number(event.target.value))}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-foreground">Height (px)</span>
            <input
              type="number"
              min={1}
              value={height}
              onChange={(event) => onHeightChange(Number(event.target.value))}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
        </div>

        <label className="mt-3 flex items-center gap-2 text-sm text-muted">
          <input
            type="checkbox"
            checked={lockAspect}
            onChange={(event) => setLockAspect(event.target.checked)}
          />
          Lock aspect ratio
        </label>

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => applyPreset("custom")}
            className={`rounded-md border px-2 py-1 text-xs font-semibold transition ${
              mode === "custom"
                ? "border-brand bg-brand/10 text-brand"
                : "border-line text-muted hover:border-brand hover:text-brand"
            }`}
          >
            Custom
          </button>
          {Object.entries(PRESETS).map(([key, preset]) => (
            <button
              key={key}
              type="button"
              onClick={() => applyPreset(key as ResizeMode)}
              className={`rounded-md border px-2 py-1 text-xs font-semibold transition ${
                mode === key
                  ? "border-brand bg-brand/10 text-brand"
                  : "border-line text-muted hover:border-brand hover:text-brand"
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={resize}
            disabled={!file || isProcessing}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isProcessing ? "Resizing..." : "Resize"}
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
              <p className="mb-1 text-xs font-semibold text-muted">Original</p>
              {inputUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={inputUrl} alt="Original preview" className="h-28 w-full rounded-lg border border-line object-cover" />
              ) : (
                <div className="flex h-28 items-center justify-center rounded-lg border border-dashed border-line text-xs text-muted">
                  No image
                </div>
              )}
            </div>
            <div>
              <p className="mb-1 text-xs font-semibold text-muted">Resized</p>
              {outputUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={outputUrl} alt="Resized preview" className="h-28 w-full rounded-lg border border-line object-cover" />
              ) : (
                <div className="flex h-28 items-center justify-center rounded-lg border border-dashed border-line text-xs text-muted">
                  No output
                </div>
              )}
            </div>
          </div>
          {naturalWidth > 0 ? (
            <p className="mt-2 text-xs text-muted">
              Original dimensions: {naturalWidth} x {naturalHeight}
            </p>
          ) : null}
        </article>

        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Result</p>
          {stats ? (
            <div className="mt-2 text-sm">
              <p>Original: {formatBytes(stats.input)}</p>
              <p>Resized: {formatBytes(stats.output)}</p>
              <p className={`font-semibold ${stats.delta <= 0 ? "text-brand" : "text-amber-600"}`}>
                Size change: {stats.delta > 0 ? "+" : ""}
                {formatBytes(stats.delta)} ({stats.ratio > 0 ? "+" : ""}
                {stats.ratio.toFixed(1)}%)
              </p>
            </div>
          ) : (
            <p className="mt-2 text-sm text-muted">Resize to view output stats.</p>
          )}
        </article>
      </div>
    </section>
  );
}
