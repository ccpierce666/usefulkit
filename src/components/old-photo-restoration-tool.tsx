"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

type RestorationSettings = {
  denoise: number;
  contrast: number;
  fadeFix: number;
  scratchFix: number;
  sharpen: number;
};

const MAX_DIMENSION = 2200;

function clamp(value: number, min = 0, max = 255): number {
  return Math.min(max, Math.max(min, value));
}

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Unable to load image."));
    img.src = dataUrl;
  });
}

function resizeToLimit(width: number, height: number) {
  const maxSide = Math.max(width, height);
  if (maxSide <= MAX_DIMENSION) {
    return { width, height };
  }
  const scale = MAX_DIMENSION / maxSide;
  return {
    width: Math.round(width * scale),
    height: Math.round(height * scale),
  };
}

function enhancePixels(
  imageData: ImageData,
  settings: RestorationSettings,
): ImageData {
  const { data, width, height } = imageData;

  const contrastFactor = 1 + (settings.contrast / 100) * 0.7;
  const saturationFactor = 1 + (settings.fadeFix / 100) * 0.75;
  const warmReduction = (settings.fadeFix / 100) * 0.16;
  const brighten = (settings.fadeFix / 100) * 14;
  const scratchStrength = settings.scratchFix / 100;
  const scratchThreshold = 32 - scratchStrength * 18;

  const original = new Uint8ClampedArray(data);

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    r = (r - 128) * contrastFactor + 128 + brighten;
    g = (g - 128) * contrastFactor + 128 + brighten * 0.9;
    b = (b - 128) * contrastFactor + 128 + brighten * 0.8;

    const gray = 0.299 * r + 0.587 * g + 0.114 * b;
    r = gray + (r - gray) * saturationFactor;
    g = gray + (g - gray) * saturationFactor;
    b = gray + (b - gray) * saturationFactor;

    r = r - r * warmReduction * 0.7;
    g = g + g * warmReduction * 0.2;
    b = b + b * warmReduction * 0.6;

    data[i] = clamp(Math.round(r));
    data[i + 1] = clamp(Math.round(g));
    data[i + 2] = clamp(Math.round(b));
  }

  if (scratchStrength > 0.01) {
    for (let y = 1; y < height - 1; y += 1) {
      for (let x = 1; x < width - 1; x += 1) {
        const idx = (y * width + x) * 4;
        const up = ((y - 1) * width + x) * 4;
        const down = ((y + 1) * width + x) * 4;
        const left = (y * width + (x - 1)) * 4;
        const right = (y * width + (x + 1)) * 4;

        const currentLum = 0.299 * original[idx] + 0.587 * original[idx + 1] + 0.114 * original[idx + 2];
        const avgLum =
          (0.299 * original[up] + 0.587 * original[up + 1] + 0.114 * original[up + 2] +
            (0.299 * original[down] + 0.587 * original[down + 1] + 0.114 * original[down + 2]) +
            (0.299 * original[left] + 0.587 * original[left + 1] + 0.114 * original[left + 2]) +
            (0.299 * original[right] + 0.587 * original[right + 1] + 0.114 * original[right + 2])) / 4;

        if (Math.abs(currentLum - avgLum) > scratchThreshold) {
          const blend = 0.28 + scratchStrength * 0.5;
          const avgR = (data[up] + data[down] + data[left] + data[right]) / 4;
          const avgG = (data[up + 1] + data[down + 1] + data[left + 1] + data[right + 1]) / 4;
          const avgB = (data[up + 2] + data[down + 2] + data[left + 2] + data[right + 2]) / 4;

          data[idx] = clamp(Math.round(data[idx] * (1 - blend) + avgR * blend));
          data[idx + 1] = clamp(Math.round(data[idx + 1] * (1 - blend) + avgG * blend));
          data[idx + 2] = clamp(Math.round(data[idx + 2] * (1 - blend) + avgB * blend));
        }
      }
    }
  }

  return imageData;
}

async function restoreOldPhoto(dataUrl: string, settings: RestorationSettings): Promise<string> {
  const img = await loadImage(dataUrl);
  const resized = resizeToLimit(img.naturalWidth, img.naturalHeight);

  const canvas = document.createElement("canvas");
  canvas.width = resized.width;
  canvas.height = resized.height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas is not available.");

  ctx.drawImage(img, 0, 0, resized.width, resized.height);

  if (settings.denoise > 0) {
    const denoiseCanvas = document.createElement("canvas");
    denoiseCanvas.width = resized.width;
    denoiseCanvas.height = resized.height;
    const denoiseCtx = denoiseCanvas.getContext("2d");
    if (!denoiseCtx) throw new Error("Denoise canvas unavailable.");

    denoiseCtx.filter = `blur(${(settings.denoise / 100) * 1.6}px)`;
    denoiseCtx.drawImage(canvas, 0, 0);

    const alpha = (settings.denoise / 100) * 0.52;
    ctx.globalAlpha = alpha;
    ctx.drawImage(denoiseCanvas, 0, 0);
    ctx.globalAlpha = 1;
  }

  const imageData = ctx.getImageData(0, 0, resized.width, resized.height);
  const enhanced = enhancePixels(imageData, settings);
  ctx.putImageData(enhanced, 0, 0);

  if (settings.sharpen > 0) {
    const sharpCanvas = document.createElement("canvas");
    sharpCanvas.width = resized.width;
    sharpCanvas.height = resized.height;
    const sharpCtx = sharpCanvas.getContext("2d");
    if (!sharpCtx) throw new Error("Sharpen canvas unavailable.");
    sharpCtx.drawImage(canvas, 0, 0);
    sharpCtx.filter = `contrast(${100 + settings.sharpen * 0.9}%) saturate(${105 + settings.sharpen * 0.7}%)`;
    const sharpAlpha = (settings.sharpen / 100) * 0.3;
    ctx.globalAlpha = sharpAlpha;
    ctx.drawImage(sharpCanvas, 0, 0);
    ctx.globalAlpha = 1;
  }

  return canvas.toDataURL("image/jpeg", 0.92);
}

export function OldPhotoRestorationTool() {
  const [fileName, setFileName] = useState("");
  const [inputImage, setInputImage] = useState("");
  const [outputImage, setOutputImage] = useState("");
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const [settings, setSettings] = useState<RestorationSettings>({
    denoise: 36,
    contrast: 42,
    fadeFix: 52,
    scratchFix: 48,
    sharpen: 28,
  });

  const score = useMemo(() => {
    const avg =
      (settings.denoise + settings.contrast + settings.fadeFix + settings.scratchFix + settings.sharpen) / 5;
    return Math.round(avg);
  }, [settings]);

  async function handleUpload(file: File) {
    setFileName(file.name);
    setError("");
    setOutputImage("");
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      setInputImage(result);
    };
    reader.onerror = () => setError("Failed to read this file.");
    reader.readAsDataURL(file);
  }

  async function handleRestore() {
    if (!inputImage) return;
    setIsProcessing(true);
    setError("");
    try {
      const restored = await restoreOldPhoto(inputImage, settings);
      setOutputImage(restored);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Restoration failed.");
    } finally {
      setIsProcessing(false);
    }
  }

  function downloadResult() {
    if (!outputImage) return;
    const a = document.createElement("a");
    const base = fileName ? fileName.replace(/\.[^/.]+$/, "") : "old-photo";
    a.href = outputImage;
    a.download = `${base}-restored.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  function updateSetting(key: keyof RestorationSettings, value: number) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <section className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
      <div className="rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-6">
        <h2 className="text-xl font-semibold sm:text-2xl">Old Photo Restoration</h2>
        <p className="mt-2 text-sm text-muted">
          Enhance faded photos, reduce scratches, and export a cleaner restored image.
        </p>

        <label className="mt-4 block rounded-2xl border border-dashed border-line bg-white p-4 text-sm text-muted">
          <span className="font-semibold text-foreground">Upload Old Photo</span>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="mt-3 block w-full text-sm"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                void handleUpload(file);
              }
            }}
          />
          {fileName ? <span className="mt-2 block text-xs text-foreground">Loaded: {fileName}</span> : null}
        </label>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Noise Reduction ({settings.denoise})</span>
            <input
              type="range"
              min={0}
              max={100}
              value={settings.denoise}
              onChange={(event) => updateSetting("denoise", Number(event.target.value))}
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Contrast Recovery ({settings.contrast})</span>
            <input
              type="range"
              min={0}
              max={100}
              value={settings.contrast}
              onChange={(event) => updateSetting("contrast", Number(event.target.value))}
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Fade Correction ({settings.fadeFix})</span>
            <input
              type="range"
              min={0}
              max={100}
              value={settings.fadeFix}
              onChange={(event) => updateSetting("fadeFix", Number(event.target.value))}
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Scratch Reduction ({settings.scratchFix})</span>
            <input
              type="range"
              min={0}
              max={100}
              value={settings.scratchFix}
              onChange={(event) => updateSetting("scratchFix", Number(event.target.value))}
            />
          </label>
          <label className="grid gap-1 sm:col-span-2">
            <span className="text-sm font-semibold text-foreground">Sharpness ({settings.sharpen})</span>
            <input
              type="range"
              min={0}
              max={100}
              value={settings.sharpen}
              onChange={(event) => updateSetting("sharpen", Number(event.target.value))}
            />
          </label>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void handleRestore()}
            disabled={!inputImage || isProcessing}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isProcessing ? "Restoring..." : "Restore Photo"}
          </button>
          <button
            type="button"
            onClick={downloadResult}
            disabled={!outputImage}
            className="rounded-lg border border-line px-4 py-2 text-sm font-semibold text-muted transition hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-50"
          >
            Download
          </button>
        </div>

        {error ? <p className="mt-3 text-sm font-semibold text-rose-700">{error}</p> : null}
      </div>

      <div className="grid gap-3">
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Restoration Score</p>
          <p className="mt-2 text-3xl font-bold">{score}</p>
          <p className="mt-1 text-xs text-muted">Average strength based on your current restoration settings.</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Recommendation</p>
          <p className="mt-2 text-sm text-muted">
            Start with medium values, then tune scratch reduction slowly to avoid over-smoothing faces.
          </p>
        </article>
      </div>

      {(inputImage || outputImage) ? (
        <div className="lg:col-span-2 grid gap-4 lg:grid-cols-2">
          <article className="rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-6">
            <h3 className="text-lg font-semibold sm:text-xl">Before</h3>
            <div className="mt-3 overflow-hidden rounded-2xl border border-line bg-white">
              {inputImage ? (
                <Image
                  src={inputImage}
                  alt="Old photo before restoration"
                  width={1200}
                  height={900}
                  unoptimized
                  className="h-auto w-full"
                />
              ) : (
                <div className="p-6 text-sm text-muted">Upload an image to preview.</div>
              )}
            </div>
          </article>
          <article className="rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-6">
            <h3 className="text-lg font-semibold sm:text-xl">After</h3>
            <div className="mt-3 overflow-hidden rounded-2xl border border-line bg-white">
              {outputImage ? (
                <Image
                  src={outputImage}
                  alt="Old photo after restoration"
                  width={1200}
                  height={900}
                  unoptimized
                  className="h-auto w-full"
                />
              ) : (
                <div className="p-6 text-sm text-muted">Click Restore Photo to generate output.</div>
              )}
            </div>
          </article>
        </div>
      ) : null}
    </section>
  );
}
