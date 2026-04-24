"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

type LoadedImage = {
  id: string;
  name: string;
  mimeType: string;
  dataUrl: string;
  width: number;
  height: number;
  size: number;
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Failed to read image"));
    reader.readAsDataURL(file);
  });
}

function loadImageMeta(dataUrl: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => resolve({ width: image.width, height: image.height });
    image.onerror = () => reject(new Error("Failed to load image"));
    image.src = dataUrl;
  });
}

function fitIntoPage(
  imageWidth: number,
  imageHeight: number,
  pageWidth: number,
  pageHeight: number,
  margin: number,
) {
  const maxWidth = pageWidth - margin * 2;
  const maxHeight = pageHeight - margin * 2;
  const widthScale = maxWidth / imageWidth;
  const heightScale = maxHeight / imageHeight;
  const scale = Math.min(widthScale, heightScale);
  const renderWidth = imageWidth * scale;
  const renderHeight = imageHeight * scale;

  return {
    renderWidth,
    renderHeight,
    x: (pageWidth - renderWidth) / 2,
    y: (pageHeight - renderHeight) / 2,
  };
}

export function JpgToPdfTool() {
  const [images, setImages] = useState<LoadedImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState("");
  const [exportInfo, setExportInfo] = useState<{ pages: number; totalSize: number } | null>(null);

  const totalSize = useMemo(() => images.reduce((sum, image) => sum + image.size, 0), [images]);

  async function handleFiles(fileList: FileList) {
    const files = Array.from(fileList).filter((file) => file.type.startsWith("image/"));
    if (!files.length) {
      setError("Please upload JPG, PNG, or WebP images.");
      return;
    }

    setIsLoading(true);
    setError("");
    setExportInfo(null);

    try {
      const loaded = await Promise.all(
        files.map(async (file, index) => {
          const dataUrl = await readFileAsDataUrl(file);
          const meta = await loadImageMeta(dataUrl);

          return {
            id: `${file.name}-${file.size}-${index}`,
            name: file.name,
            mimeType: file.type || "image/jpeg",
            dataUrl,
            width: meta.width,
            height: meta.height,
            size: file.size,
          } satisfies LoadedImage;
        }),
      );

      setImages(loaded);
    } catch {
      setError("Failed to read one or more images. Try smaller files or a different format.");
    } finally {
      setIsLoading(false);
    }
  }

  function moveImage(index: number, direction: -1 | 1) {
    setImages((current) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= current.length) return current;
      const cloned = [...current];
      const [item] = cloned.splice(index, 1);
      cloned.splice(nextIndex, 0, item);
      return cloned;
    });
  }

  function removeImage(id: string) {
    setImages((current) => current.filter((image) => image.id !== id));
  }

  async function exportPdf() {
    if (!images.length) {
      setError("Upload at least one image first.");
      return;
    }

    try {
      setIsExporting(true);
      setError("");
      setExportInfo(null);

      const { default: JsPdf } = await import("jspdf");
      const first = images[0];
      const initialOrientation = first.width >= first.height ? "landscape" : "portrait";
      const doc = new JsPdf({
        orientation: initialOrientation,
        unit: "pt",
        format: "a4",
      });

      images.forEach((image, index) => {
        const orientation = image.width >= image.height ? "landscape" : "portrait";
        if (index > 0) {
          doc.addPage("a4", orientation);
          doc.setPage(index + 1);
        }

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const placement = fitIntoPage(image.width, image.height, pageWidth, pageHeight, 28);
        const format =
          image.mimeType === "image/png" ? "PNG" : image.mimeType === "image/webp" ? "WEBP" : "JPEG";

        doc.addImage(
          image.dataUrl,
          format,
          placement.x,
          placement.y,
          placement.renderWidth,
          placement.renderHeight,
        );
      });

      const safeName = images[0].name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9-_]/g, "_");
      doc.save(`${safeName}-images.pdf`);
      setExportInfo({ pages: images.length, totalSize });
    } catch {
      setError("Failed to create PDF. Try fewer images or smaller files.");
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <section className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
      <div className="rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-6">
        <h2 className="text-xl font-semibold sm:text-2xl">JPG to PDF</h2>
        <p className="mt-2 text-sm text-muted">
          Upload one or more images, reorder them, and export a clean multi-page PDF in your browser.
        </p>

        <label className="mt-4 block rounded-2xl border border-dashed border-line bg-white p-4 text-sm text-muted">
          <span className="font-semibold text-foreground">Upload Images</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
            multiple
            className="mt-3 block w-full text-sm"
            onChange={(event) => {
              const fileList = event.target.files;
              if (fileList && fileList.length > 0) {
                void handleFiles(fileList);
              }
            }}
          />
          <span className="mt-2 block text-xs">Supports JPG, PNG, and WebP. Files stay in your browser.</span>
        </label>

        {images.length > 0 ? (
          <div className="mt-4 rounded-2xl border border-line bg-white p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">Page Order</p>
                <p className="text-xs text-muted">The list order becomes the PDF page order.</p>
              </div>
            </div>

            <div className="mt-3 grid gap-3">
              {images.map((image, index) => (
                <article
                  key={image.id}
                  className="grid gap-3 rounded-2xl border border-line p-3 sm:grid-cols-[88px_minmax(0,1fr)_auto]"
                >
                  <Image
                    src={image.dataUrl}
                    alt={image.name}
                    width={96}
                    height={96}
                    unoptimized
                    className="h-24 w-24 rounded-xl object-cover"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{image.name}</p>
                    <p className="mt-1 text-xs text-muted">
                      {image.width} x {image.height} px
                    </p>
                    <p className="mt-1 text-xs text-muted">{formatBytes(image.size)}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 self-start">
                    <button
                      type="button"
                      onClick={() => moveImage(index, -1)}
                      disabled={index === 0}
                      className="rounded-lg border border-line bg-white px-3 py-2 text-xs font-semibold text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Up
                    </button>
                    <button
                      type="button"
                      onClick={() => moveImage(index, 1)}
                      disabled={index === images.length - 1}
                      className="rounded-lg border border-line bg-white px-3 py-2 text-xs font-semibold text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Down
                    </button>
                    <button
                      type="button"
                      onClick={() => removeImage(image.id)}
                      className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700"
                    >
                      Remove
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ) : null}

        {error ? <p className="mt-3 text-sm font-semibold text-rose-700">{error}</p> : null}

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void exportPdf()}
            disabled={!images.length || isLoading || isExporting}
            className="rounded-xl border border-brand bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isExporting ? "Creating PDF..." : "Create PDF"}
          </button>
          <p className="self-center text-xs text-muted">Portrait and landscape pages adjust automatically.</p>
        </div>
      </div>

      <div className="grid gap-3">
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Images</p>
          <p className="mt-2 text-3xl font-bold">{images.length}</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Input Size</p>
          <p className="mt-2 text-3xl font-bold">{images.length ? formatBytes(totalSize) : "-"}</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Workflow</p>
          <p className="mt-2 text-sm text-foreground">
            Upload images, reorder pages, then export one PDF for printing, emailing, or document submission.
          </p>
        </article>
        {exportInfo ? (
          <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Last Export</p>
            <p className="mt-2 text-sm text-foreground">
              {exportInfo.pages} pages built from {formatBytes(exportInfo.totalSize)} of source images.
            </p>
          </article>
        ) : null}
      </div>
    </section>
  );
}
