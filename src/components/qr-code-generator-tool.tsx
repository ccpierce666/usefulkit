"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

type ErrorLevel = "L" | "M" | "Q" | "H";

export function QrCodeGeneratorTool() {
  const [value, setValue] = useState("https://usefulkit.io");
  const [size, setSize] = useState(320);
  const [margin, setMargin] = useState(2);
  const [darkColor, setDarkColor] = useState("#111827");
  const [lightColor, setLightColor] = useState("#ffffff");
  const [errorLevel, setErrorLevel] = useState<ErrorLevel>("M");
  const [dataUrl, setDataUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  const canGenerate = useMemo(() => value.trim().length > 0, [value]);

  useEffect(() => {
    let cancelled = false;

    async function generate() {
      if (!canGenerate) {
        setDataUrl("");
        return;
      }
      setIsGenerating(true);
      setError("");
      try {
        const QRCode = await import("qrcode");
        const url = await QRCode.toDataURL(value.trim(), {
          width: size,
          margin,
          color: {
            dark: darkColor,
            light: lightColor,
          },
          errorCorrectionLevel: errorLevel,
        });
        if (!cancelled) {
          setDataUrl(url);
        }
      } catch {
        if (!cancelled) {
          setDataUrl("");
          setError("Failed to generate QR code. Please check your input and try again.");
        }
      } finally {
        if (!cancelled) {
          setIsGenerating(false);
        }
      }
    }

    void generate();
    return () => {
      cancelled = true;
    };
  }, [value, size, margin, darkColor, lightColor, errorLevel, canGenerate]);

  function downloadPng() {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "qrcode.png";
    a.click();
  }

  return (
    <section className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
      <div className="rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-6">
        <h2 className="text-xl font-semibold sm:text-2xl">QR Code Generator</h2>
        <p className="mt-2 text-sm text-muted">
          Generate QR codes for links, text, email, phone, and Wi-Fi strings in seconds.
        </p>

        <label className="mt-4 grid gap-1">
          <span className="text-sm font-semibold text-foreground">Content</span>
          <textarea
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="Enter URL or text"
            className="h-28 w-full resize-y rounded-xl border border-line bg-white px-3 py-2 text-sm outline-none transition focus:border-brand"
          />
        </label>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted">Size</span>
            <select
              value={size}
              onChange={(event) => setSize(Number(event.target.value))}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            >
              <option value={256}>256 px</option>
              <option value={320}>320 px</option>
              <option value={384}>384 px</option>
              <option value={512}>512 px</option>
            </select>
          </label>
          <label className="grid gap-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted">Error Correction</span>
            <select
              value={errorLevel}
              onChange={(event) => setErrorLevel(event.target.value as ErrorLevel)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            >
              <option value="L">Low (L)</option>
              <option value="M">Medium (M)</option>
              <option value="Q">Quartile (Q)</option>
              <option value="H">High (H)</option>
            </select>
          </label>
          <label className="grid gap-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted">Margin</span>
            <input
              type="number"
              min={0}
              max={8}
              value={margin}
              onChange={(event) => setMargin(Math.min(8, Math.max(0, Number(event.target.value) || 0)))}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted">Foreground</span>
              <input
                type="color"
                value={darkColor}
                onChange={(event) => setDarkColor(event.target.value)}
                className="h-10 w-full rounded-lg border border-line bg-white p-1"
              />
            </label>
            <label className="grid gap-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted">Background</span>
              <input
                type="color"
                value={lightColor}
                onChange={(event) => setLightColor(event.target.value)}
                className="h-10 w-full rounded-lg border border-line bg-white p-1"
              />
            </label>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={downloadPng}
            disabled={!dataUrl}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-50"
          >
            Download PNG
          </button>
          <button
            type="button"
            onClick={() => {
              setValue("");
              setDataUrl("");
            }}
            className="rounded-lg border border-line px-4 py-2 text-sm font-semibold text-muted transition hover:border-brand hover:text-brand"
          >
            Clear
          </button>
        </div>

        {error ? <p className="mt-3 text-sm font-semibold text-rose-700">{error}</p> : null}
      </div>

      <div className="grid gap-3">
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Preview</p>
          <div className="mt-3 flex min-h-64 items-center justify-center rounded-xl border border-line bg-white p-4">
            {isGenerating ? (
              <p className="text-sm text-muted">Generating...</p>
            ) : dataUrl ? (
              <Image src={dataUrl} alt="Generated QR code" width={size} height={size} className="h-auto w-full max-w-72" />
            ) : (
              <p className="text-sm text-muted">Enter content to generate QR code.</p>
            )}
          </div>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Tips</p>
          <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-muted">
            <li>Use short URLs for better scan reliability.</li>
            <li>High error correction helps damaged-print recovery.</li>
            <li>Test scan before printing in bulk.</li>
          </ul>
        </article>
      </div>
    </section>
  );
}
