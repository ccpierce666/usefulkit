"use client";

import { useMemo, useState } from "react";
import { degrees, PDFDocument, StandardFonts, rgb } from "pdf-lib";

type WatermarkPosition = "center" | "top-left" | "top-right" | "bottom-left" | "bottom-right";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function hexToRgb(hex: string) {
  const safeHex = hex.replace("#", "");
  const normalized =
    safeHex.length === 3
      ? safeHex
          .split("")
          .map((char) => char + char)
          .join("")
      : safeHex;

  const value = Number.parseInt(normalized, 16);
  const r = ((value >> 16) & 255) / 255;
  const g = ((value >> 8) & 255) / 255;
  const b = (value & 255) / 255;
  return rgb(r, g, b);
}

function getPlacement(
  position: WatermarkPosition,
  pageWidth: number,
  pageHeight: number,
  textWidth: number,
  fontSize: number,
) {
  const padding = 28;

  if (position === "center") {
    return {
      x: (pageWidth - textWidth) / 2,
      y: (pageHeight - fontSize) / 2,
      rotate: degrees(-30),
    };
  }

  if (position === "top-left") {
    return { x: padding, y: pageHeight - fontSize - padding, rotate: degrees(0) };
  }

  if (position === "top-right") {
    return { x: pageWidth - textWidth - padding, y: pageHeight - fontSize - padding, rotate: degrees(0) };
  }

  if (position === "bottom-left") {
    return { x: padding, y: padding, rotate: degrees(0) };
  }

  return { x: pageWidth - textWidth - padding, y: padding, rotate: degrees(0) };
}

export function AddWatermarkPdfTool() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [text, setText] = useState("CONFIDENTIAL");
  const [fontSize, setFontSize] = useState(36);
  const [opacity, setOpacity] = useState(0.18);
  const [color, setColor] = useState("#475569");
  const [position, setPosition] = useState<WatermarkPosition>("center");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [lastExportSize, setLastExportSize] = useState(0);

  const watermarkPreview = useMemo(
    () => `${text || "CONFIDENTIAL"} • ${fontSize}px • ${Math.round(opacity * 100)}% opacity`,
    [fontSize, opacity, text],
  );

  async function handleFile(nextFile: File) {
    setFile(nextFile);
    setError("");
    setLastExportSize(0);

    try {
      const bytes = await nextFile.arrayBuffer();
      const pdf = await PDFDocument.load(bytes);
      setPageCount(pdf.getPageCount());
    } catch {
      setPageCount(0);
      setError("Failed to read this PDF file.");
    }
  }

  async function handleWatermark() {
    if (!file) {
      setError("Please upload a PDF file first.");
      return;
    }

    if (!text.trim()) {
      setError("Please enter watermark text.");
      return;
    }

    try {
      setIsProcessing(true);
      setError("");

      const bytes = await file.arrayBuffer();
      const pdf = await PDFDocument.load(bytes);
      const font = await pdf.embedFont(StandardFonts.HelveticaBold);
      const textColor = hexToRgb(color);

      pdf.getPages().forEach((page) => {
        const { width, height } = page.getSize();
        const textWidth = font.widthOfTextAtSize(text, fontSize);
        const placement = getPlacement(position, width, height, textWidth, fontSize);

        page.drawText(text, {
          x: placement.x,
          y: placement.y,
          size: fontSize,
          font,
          color: textColor,
          opacity,
          rotate: placement.rotate,
        });
      });

      const outputBytes = await pdf.save();
      const safeBytes = new Uint8Array(outputBytes);
      const blob = new Blob([safeBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${file.name.replace(/\.pdf$/i, "") || "document"}-watermarked.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setLastExportSize(blob.size);
    } catch {
      setError("Failed to add watermark. Check the PDF and try again.");
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <section className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
      <div className="rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-6">
        <h2 className="text-xl font-semibold sm:text-2xl">Add Watermark to PDF</h2>
        <p className="mt-2 text-sm text-muted">
          Add a text watermark to every page in your PDF for review copies, internal docs, and client delivery.
        </p>

        <label className="mt-4 block rounded-2xl border border-dashed border-line bg-white p-4 text-sm text-muted">
          <span className="font-semibold text-foreground">Upload PDF</span>
          <input
            type="file"
            accept="application/pdf,.pdf"
            className="mt-3 block w-full text-sm"
            onChange={(event) => {
              const next = event.target.files?.[0];
              if (next) {
                void handleFile(next);
              }
            }}
          />
          {file ? <span className="mt-2 block text-xs text-foreground">Loaded: {file.name}</span> : null}
        </label>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1 sm:col-span-2">
            <span className="text-sm font-semibold text-foreground">Watermark Text</span>
            <input
              type="text"
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="Example: CONFIDENTIAL"
              className="h-11 rounded-xl border border-line bg-white px-3 text-sm outline-none transition focus:border-brand"
            />
          </label>

          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Position</span>
            <select
              value={position}
              onChange={(event) => setPosition(event.target.value as WatermarkPosition)}
              className="h-11 rounded-xl border border-line bg-white px-3 text-sm outline-none transition focus:border-brand"
            >
              <option value="center">Center Diagonal</option>
              <option value="top-left">Top Left</option>
              <option value="top-right">Top Right</option>
              <option value="bottom-left">Bottom Left</option>
              <option value="bottom-right">Bottom Right</option>
            </select>
          </label>

          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Color</span>
            <input
              type="color"
              value={color}
              onChange={(event) => setColor(event.target.value)}
              className="h-11 w-full rounded-xl border border-line bg-white p-2"
            />
          </label>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">Font Size: {fontSize}px</span>
            <input
              type="range"
              min="18"
              max="72"
              step="2"
              value={fontSize}
              onChange={(event) => setFontSize(Number(event.target.value))}
            />
          </label>

          <label className="grid gap-1">
            <span className="text-sm font-semibold text-foreground">
              Opacity: {Math.round(opacity * 100)}%
            </span>
            <input
              type="range"
              min="5"
              max="80"
              step="5"
              value={Math.round(opacity * 100)}
              onChange={(event) => setOpacity(Number(event.target.value) / 100)}
            />
          </label>
        </div>

        <div className="mt-4 rounded-2xl border border-line bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Preview Settings</p>
          <p className="mt-2 text-sm text-foreground">{watermarkPreview}</p>
        </div>

        <button
          type="button"
          onClick={() => void handleWatermark()}
          disabled={!file || isProcessing}
          className="mt-4 rounded-xl border border-brand bg-brand px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isProcessing ? "Adding Watermark..." : "Add Watermark and Download"}
        </button>

        {error ? <p className="mt-3 text-sm font-semibold text-rose-700">{error}</p> : null}
      </div>

      <div className="grid gap-3">
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Original Size</p>
          <p className="mt-2 text-3xl font-bold">{file ? formatBytes(file.size) : "-"}</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Pages</p>
          <p className="mt-2 text-3xl font-bold">{pageCount || "-"}</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Watermark</p>
          <p className="mt-2 text-sm font-semibold text-foreground">{text || "-"}</p>
          <p className="mt-1 text-xs text-muted">Applied to every page in the exported PDF.</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Last Export</p>
          <p className="mt-2 text-3xl font-bold">{lastExportSize ? formatBytes(lastExportSize) : "-"}</p>
        </article>
      </div>
    </section>
  );
}
