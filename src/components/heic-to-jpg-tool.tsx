"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(2)} MB`;
}

async function convertHeicToJpg(file: File, quality: number): Promise<Blob> {
  const heic2anyModule = await import("heic2any");
  const heic2any = heic2anyModule.default as unknown as (options: {
    blob: Blob;
    toType: string;
    quality: number;
  }) => Promise<Blob | Blob[]>;
  const result = await heic2any({
    blob: file,
    toType: "image/jpeg",
    quality,
  });
  return Array.isArray(result) ? result[0] : result;
}

export function HeicToJpgTool() {
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState(0.9);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [outputBlob, setOutputBlob] = useState<Blob | null>(null);
  const [outputUrl, setOutputUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    if (!outputBlob) {
      setOutputUrl("");
      return;
    }
    const url = URL.createObjectURL(outputBlob);
    setOutputUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [outputBlob]);

  useEffect(() => {
    if (!file) {
      setPreviewUrl("");
      return;
    }
    const canPreview = file.type === "image/jpeg" || file.type === "image/png" || file.type === "image/webp";
    if (!canPreview) {
      setPreviewUrl("");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  async function handleConvert() {
    if (!file) {
      setError("Please upload a HEIC or HEIF image first.");
      return;
    }
    setError("");
    setIsProcessing(true);
    try {
      const converted = await convertHeicToJpg(file, quality);
      setOutputBlob(converted);
    } catch {
      setOutputBlob(null);
      setError("HEIC conversion failed. Try another file or a smaller image.");
    } finally {
      setIsProcessing(false);
    }
  }

  function handleDownload() {
    if (!outputUrl || !file) return;
    const base = file.name.replace(/\.[^/.]+$/, "");
    const anchor = document.createElement("a");
    anchor.href = outputUrl;
    anchor.download = `${base}.jpg`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  }

  return (
    <section className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
      <div className="rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-6">
        <h2 className="text-xl font-semibold sm:text-2xl">HEIC to JPG</h2>
        <p className="mt-2 text-sm text-muted">
          Convert iPhone HEIC/HEIF photos to JPG directly in your browser.
        </p>

        <label className="mt-4 grid gap-2">
          <span className="text-sm font-semibold text-foreground">Upload HEIC / HEIF</span>
          <input
            type="file"
            accept=".heic,.heif,image/heic,image/heif"
            onChange={(event) => {
              setFile(event.target.files?.[0] ?? null);
              setOutputBlob(null);
              setError("");
            }}
            className="h-11 rounded-xl border border-line bg-white px-3 py-2 text-sm outline-none"
          />
        </label>

        <label className="mt-4 grid gap-2 sm:max-w-md">
          <span className="text-sm font-semibold text-foreground">JPG Quality ({Math.round(quality * 100)}%)</span>
          <input
            type="range"
            min={50}
            max={98}
            value={Math.round(quality * 100)}
            onChange={(event) => setQuality(Number(event.target.value) / 100)}
          />
        </label>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void handleConvert()}
            disabled={!file || isProcessing}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isProcessing ? "Converting..." : "Convert to JPG"}
          </button>
          <button
            type="button"
            onClick={handleDownload}
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
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Input</p>
          {file ? (
            <div className="mt-2 text-sm">
              <p className="font-semibold text-foreground">{file.name}</p>
              <p className="text-muted">Type: {file.type || "unknown"}</p>
              <p className="text-muted">Size: {formatBytes(file.size)}</p>
            </div>
          ) : (
            <p className="mt-2 text-sm text-muted">No file selected.</p>
          )}
        </article>

        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Output</p>
          {outputBlob ? (
            <div className="mt-2 text-sm">
              <p className="font-semibold text-foreground">{formatBytes(outputBlob.size)}</p>
              <p className="text-muted">Format: JPG</p>
            </div>
          ) : (
            <p className="mt-2 text-sm text-muted">Convert file to see output info.</p>
          )}
        </article>
      </div>

      {(previewUrl || outputUrl) ? (
        <div className="lg:col-span-2 grid gap-4 lg:grid-cols-2">
          <article className="rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-6">
            <h3 className="text-lg font-semibold sm:text-xl">Input Preview</h3>
            <div className="mt-3 overflow-hidden rounded-2xl border border-line bg-white">
              {previewUrl ? (
                <Image
                  src={previewUrl}
                  alt="Uploaded preview"
                  width={1200}
                  height={900}
                  unoptimized
                  className="h-auto w-full"
                />
              ) : (
                <div className="p-6 text-sm text-muted">
                  HEIC previews are not available in some browsers, but conversion still works.
                </div>
              )}
            </div>
          </article>
          <article className="rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-6">
            <h3 className="text-lg font-semibold sm:text-xl">JPG Output</h3>
            <div className="mt-3 overflow-hidden rounded-2xl border border-line bg-white">
              {outputUrl ? (
                <Image
                  src={outputUrl}
                  alt="Converted JPG output"
                  width={1200}
                  height={900}
                  unoptimized
                  className="h-auto w-full"
                />
              ) : (
                <div className="p-6 text-sm text-muted">No converted output yet.</div>
              )}
            </div>
          </article>
        </div>
      ) : null}
    </section>
  );
}

