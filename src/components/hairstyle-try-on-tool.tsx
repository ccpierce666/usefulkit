"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

type HairstylePreset = {
  id: string;
  label: string;
  desc: string;
};

const HAIRSTYLE_PRESETS: HairstylePreset[] = [
  { id: "curtain-bangs", label: "Curtain Bangs", desc: "Middle-part bangs with soft side flow." },
  { id: "classic-bob", label: "Classic Bob", desc: "Jaw-length bob with rounded volume." },
  { id: "wolf-cut", label: "Wolf Cut", desc: "Layered top with textured shape." },
  { id: "pixie-cut", label: "Pixie Cut", desc: "Short cropped style with clean silhouette." },
  { id: "long-waves", label: "Long Waves", desc: "Long layered waves with soft movement." },
  { id: "slick-back", label: "Slick Back", desc: "Pulled-back style with lower front volume." },
];

const COLOR_PRESETS = [
  { value: "#3b2a22", label: "Dark Brown" },
  { value: "#6a4b34", label: "Chestnut" },
  { value: "#2d2d2d", label: "Natural Black" },
  { value: "#8a6a44", label: "Caramel Brown" },
  { value: "#b08a67", label: "Light Brown" },
  { value: "#6b1e20", label: "Burgundy" },
];

function hexToRgba(hex: string, alpha: number): string {
  const cleaned = hex.replace("#", "");
  const normalized = cleaned.length === 3
    ? cleaned.split("").map((ch) => `${ch}${ch}`).join("")
    : cleaned;
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function drawHairstyleMask(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  styleId: string,
  color: string,
) {
  const main = hexToRgba(color, 0.44);
  const shade = hexToRgba(color, 0.2);
  const glow = hexToRgba("#ffffff", 0.08);

  ctx.save();
  ctx.fillStyle = main;
  ctx.strokeStyle = shade;
  ctx.lineWidth = Math.max(2, width * 0.005);

  const headTop = height * 0.18;
  const hairBottomDefault = height * 0.44;
  const centerX = width * 0.5;

  const drawBaseCap = (bottomY: number) => {
    ctx.beginPath();
    ctx.moveTo(width * 0.22, bottomY);
    ctx.quadraticCurveTo(width * 0.18, height * 0.28, width * 0.26, headTop);
    ctx.quadraticCurveTo(centerX, height * 0.05, width * 0.74, headTop);
    ctx.quadraticCurveTo(width * 0.82, height * 0.28, width * 0.78, bottomY);
    ctx.closePath();
    ctx.fill();
  };

  if (styleId === "classic-bob") {
    drawBaseCap(height * 0.53);
    ctx.beginPath();
    ctx.moveTo(width * 0.2, height * 0.52);
    ctx.quadraticCurveTo(centerX, height * 0.6, width * 0.8, height * 0.52);
    ctx.stroke();
  } else if (styleId === "wolf-cut") {
    drawBaseCap(hairBottomDefault);
    for (let i = 0; i < 7; i += 1) {
      const x = width * (0.24 + i * 0.08);
      ctx.beginPath();
      ctx.moveTo(x, hairBottomDefault);
      ctx.lineTo(x + width * 0.03, hairBottomDefault + height * 0.08);
      ctx.lineTo(x + width * 0.06, hairBottomDefault);
      ctx.closePath();
      ctx.fill();
    }
  } else if (styleId === "pixie-cut") {
    drawBaseCap(height * 0.36);
    ctx.beginPath();
    ctx.moveTo(width * 0.32, headTop);
    ctx.quadraticCurveTo(width * 0.5, height * 0.1, width * 0.68, headTop);
    ctx.stroke();
  } else if (styleId === "long-waves") {
    drawBaseCap(height * 0.47);
    ctx.beginPath();
    ctx.moveTo(width * 0.22, height * 0.42);
    ctx.quadraticCurveTo(width * 0.15, height * 0.65, width * 0.25, height * 0.86);
    ctx.quadraticCurveTo(width * 0.32, height * 0.76, width * 0.33, height * 0.62);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(width * 0.78, height * 0.42);
    ctx.quadraticCurveTo(width * 0.85, height * 0.65, width * 0.75, height * 0.86);
    ctx.quadraticCurveTo(width * 0.68, height * 0.76, width * 0.67, height * 0.62);
    ctx.stroke();
  } else if (styleId === "slick-back") {
    drawBaseCap(height * 0.38);
    ctx.beginPath();
    for (let i = 0; i < 6; i += 1) {
      const x = width * (0.3 + i * 0.08);
      ctx.moveTo(x, height * 0.34);
      ctx.lineTo(x + width * 0.06, headTop + height * 0.03);
    }
    ctx.stroke();
  } else {
    drawBaseCap(hairBottomDefault);
    ctx.beginPath();
    ctx.moveTo(width * 0.47, headTop + height * 0.03);
    ctx.quadraticCurveTo(width * 0.42, height * 0.32, width * 0.37, hairBottomDefault);
    ctx.moveTo(width * 0.53, headTop + height * 0.03);
    ctx.quadraticCurveTo(width * 0.58, height * 0.32, width * 0.63, hairBottomDefault);
    ctx.stroke();
  }

  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.ellipse(centerX, headTop + height * 0.06, width * 0.18, height * 0.04, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

async function renderDemoPreview(imageDataUrl: string, styleId: string, color: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Failed to initialize canvas context."));
        return;
      }

      ctx.drawImage(img, 0, 0, img.width, img.height);
      drawHairstyleMask(ctx, img.width, img.height, styleId, color);
      resolve(canvas.toDataURL("image/jpeg", 0.92));
    };
    img.onerror = () => reject(new Error("Failed to read image data."));
    img.src = imageDataUrl;
  });
}

type ApiResponse = {
  mode: "demo" | "provider";
  notes?: string[];
  outputImageDataUrl: string;
};

export function HairstyleTryOnTool() {
  const [sourceImageDataUrl, setSourceImageDataUrl] = useState("");
  const [resultImageDataUrl, setResultImageDataUrl] = useState("");
  const [styleId, setStyleId] = useState(HAIRSTYLE_PRESETS[0].id);
  const [color, setColor] = useState(COLOR_PRESETS[0].value);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState("Upload a face photo to start.");
  const [apiMode, setApiMode] = useState<"demo" | "provider">("demo");

  const selectedStyle = useMemo(
    () => HAIRSTYLE_PRESETS.find((preset) => preset.id === styleId) ?? HAIRSTYLE_PRESETS[0],
    [styleId],
  );

  async function handleUpload(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      const value = typeof reader.result === "string" ? reader.result : "";
      setSourceImageDataUrl(value);
      setResultImageDataUrl("");
      setStatus("Image loaded. Choose style and generate preview.");
    };
    reader.onerror = () => {
      setStatus("Could not read this file. Try another image.");
    };
    reader.readAsDataURL(file);
  }

  async function generatePreview() {
    if (!sourceImageDataUrl) return;
    setIsLoading(true);
    setStatus("Generating hairstyle preview...");
    try {
      const response = await fetch("/api/hairstyle-try-on", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageDataUrl: sourceImageDataUrl,
          styleId,
          color,
        }),
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      const data = (await response.json()) as ApiResponse;
      setApiMode(data.mode);

      if (data.mode === "provider") {
        setResultImageDataUrl(data.outputImageDataUrl);
        setStatus("AI preview generated.");
      } else {
        const demo = await renderDemoPreview(sourceImageDataUrl, styleId, color);
        setResultImageDataUrl(demo);
        setStatus("Demo preview generated. You can replace this with provider output later.");
      }
    } catch {
      try {
        const fallback = await renderDemoPreview(sourceImageDataUrl, styleId, color);
        setResultImageDataUrl(fallback);
        setApiMode("demo");
        setStatus("Provider unavailable. Demo preview generated locally.");
      } catch {
        setStatus("Failed to generate preview. Try a different image.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
      <div className="rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-6">
        <h2 className="text-xl font-semibold sm:text-2xl">Hairstyle Try-On</h2>
        <p className="mt-2 text-sm text-muted">
          Upload a portrait, choose hairstyle and color, then generate a quick preview.
        </p>

        <label className="mt-4 block rounded-2xl border border-dashed border-line bg-white p-4 text-sm text-muted">
          <span className="font-semibold text-foreground">Upload Portrait</span>
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
        </label>

        <div className="mt-4 grid gap-3">
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Hairstyle</span>
            <select
              value={styleId}
              onChange={(event) => setStyleId(event.target.value)}
              className="h-11 rounded-xl border border-line bg-white px-3 text-sm outline-none transition focus:border-brand"
            >
              {HAIRSTYLE_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.label}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Hair Color</span>
            <select
              value={color}
              onChange={(event) => setColor(event.target.value)}
              className="h-11 rounded-xl border border-line bg-white px-3 text-sm outline-none transition focus:border-brand"
            >
              {COLOR_PRESETS.map((preset) => (
                <option key={preset.value} value={preset.value}>
                  {preset.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void generatePreview()}
            disabled={!sourceImageDataUrl || isLoading}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? "Generating..." : "Generate Preview"}
          </button>
          <button
            type="button"
            onClick={() => {
              setSourceImageDataUrl("");
              setResultImageDataUrl("");
              setApiMode("demo");
              setStatus("Upload a face photo to start.");
            }}
            className="rounded-lg border border-line px-4 py-2 text-sm font-semibold text-muted transition hover:border-brand hover:text-brand"
          >
            Reset
          </button>
        </div>

        <div className="mt-3 rounded-xl border border-line bg-white px-3 py-2 text-xs text-muted">
          <p>Status: {status}</p>
          <p className="mt-1">Mode: {apiMode === "provider" ? "AI Provider" : "Local Demo"}</p>
        </div>
      </div>

      <div className="grid gap-3">
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Selected Style</p>
          <p className="mt-2 text-base font-semibold text-foreground">{selectedStyle.label}</p>
          <p className="mt-1 text-xs text-muted">{selectedStyle.desc}</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Color</p>
          <div className="mt-2 flex items-center gap-2">
            <span className="inline-block h-4 w-4 rounded-full border border-line" style={{ background: color }} />
            <span className="text-sm font-semibold text-foreground">{color}</span>
          </div>
        </article>
      </div>

      {(sourceImageDataUrl || resultImageDataUrl) ? (
        <div className="lg:col-span-2 grid gap-4 lg:grid-cols-2">
          <article className="rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-6">
            <h3 className="text-lg font-semibold sm:text-xl">Original</h3>
            <div className="mt-3 overflow-hidden rounded-2xl border border-line bg-white">
              {sourceImageDataUrl ? (
                <Image
                  src={sourceImageDataUrl}
                  alt="Original upload"
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
            <h3 className="text-lg font-semibold sm:text-xl">Preview</h3>
            <div className="mt-3 overflow-hidden rounded-2xl border border-line bg-white">
              {resultImageDataUrl ? (
                <Image
                  src={resultImageDataUrl}
                  alt="Hairstyle preview result"
                  width={1200}
                  height={900}
                  unoptimized
                  className="h-auto w-full"
                />
              ) : (
                <div className="p-6 text-sm text-muted">Generate preview to see result.</div>
              )}
            </div>
          </article>
        </div>
      ) : null}
    </section>
  );
}
