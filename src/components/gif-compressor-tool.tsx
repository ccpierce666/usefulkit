"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { ensureFfmpegLoaded, safeDeleteFile, toFfmpegInput } from "@/lib/ffmpeg-client";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(2)} MB`;
}

export function GifCompressorTool() {
  const [file, setFile] = useState<File | null>(null);
  const [fps, setFps] = useState(12);
  const [scalePercent, setScalePercent] = useState(80);
  const [colors, setColors] = useState(128);
  const [isProcessing, setIsProcessing] = useState(false);
  const [engineState, setEngineState] = useState<"idle" | "loading" | "ready">("idle");
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
    const saved = file.size - outputBlob.size;
    const ratio = file.size > 0 ? (saved / file.size) * 100 : 0;
    return {
      input: file.size,
      output: outputBlob.size,
      saved,
      ratio,
    };
  }, [file, outputBlob]);

  async function compress() {
    if (!file) {
      setError("Please upload GIF first.");
      return;
    }
    if (file.size > 35 * 1024 * 1024) {
      setError("For browser stability, please keep GIF files under 35MB.");
      return;
    }

    setError("");
    setIsProcessing(true);
    try {
      setEngineState("loading");
      const ffmpeg = await ensureFfmpegLoaded();
      setEngineState("ready");

      const inputName = "input.gif";
      const paletteName = "palette.png";
      const outputName = "output.gif";

      const scaleExpr = `scale=trunc(iw*${scalePercent}/100):-1:flags=lanczos`;

      await ffmpeg.writeFile(inputName, await toFfmpegInput(file));
      await ffmpeg.exec([
        "-i",
        inputName,
        "-vf",
        `fps=${fps},${scaleExpr},palettegen=max_colors=${colors}`,
        paletteName,
      ]);
      await ffmpeg.exec([
        "-i",
        inputName,
        "-i",
        paletteName,
        "-lavfi",
        `fps=${fps},${scaleExpr}[x];[x][1:v]paletteuse=dither=bayer`,
        "-loop",
        "0",
        outputName,
      ]);

      const data = await ffmpeg.readFile(outputName);
      const normalized = Uint8Array.from(data);
      setOutputBlob(new Blob([normalized], { type: "image/gif" }));

      await safeDeleteFile(ffmpeg, inputName);
      await safeDeleteFile(ffmpeg, paletteName);
      await safeDeleteFile(ffmpeg, outputName);
    } catch {
      setOutputBlob(null);
      setError("GIF compression failed. Try lower FPS, smaller scale, or fewer colors.");
    } finally {
      setIsProcessing(false);
    }
  }

  function download() {
    if (!outputUrl || !file) return;
    const base = file.name.replace(/\.[^/.]+$/, "");
    const anchor = document.createElement("a");
    anchor.href = outputUrl;
    anchor.download = `${base}-compressed.gif`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  }

  return (
    <section className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
      <div className="rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-6">
        <h2 className="text-xl font-semibold sm:text-2xl">GIF Compressor</h2>
        <p className="mt-2 text-sm text-muted">
          Reduce GIF file size by tuning FPS, dimensions, and color palette.
        </p>

        <label className="mt-4 grid gap-2">
          <span className="text-sm font-semibold text-foreground">Upload GIF</span>
          <input
            type="file"
            accept="image/gif,.gif"
            onChange={(event) => {
              setFile(event.target.files?.[0] ?? null);
              setOutputBlob(null);
              setError("");
            }}
            className="h-11 rounded-xl border border-line bg-white px-3 py-2 text-sm outline-none"
          />
        </label>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-foreground">FPS ({fps})</span>
            <input
              type="range"
              min={8}
              max={24}
              value={fps}
              onChange={(event) => setFps(Number(event.target.value))}
            />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-foreground">Scale ({scalePercent}%)</span>
            <input
              type="range"
              min={40}
              max={100}
              value={scalePercent}
              onChange={(event) => setScalePercent(Number(event.target.value))}
            />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-foreground">Max Colors ({colors})</span>
            <input
              type="range"
              min={32}
              max={256}
              step={16}
              value={colors}
              onChange={(event) => setColors(Number(event.target.value))}
            />
          </label>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void compress()}
            disabled={!file || isProcessing}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isProcessing ? "Compressing..." : "Compress GIF"}
          </button>
          <button
            type="button"
            onClick={download}
            disabled={!outputBlob}
            className="rounded-lg border border-line px-4 py-2 text-sm font-semibold text-muted transition hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-50"
          >
            Download GIF
          </button>
        </div>

        <p className="mt-3 text-xs text-muted">
          Engine: {engineState === "ready" ? "Loaded" : engineState === "loading" ? "Loading ffmpeg..." : "Idle"}
        </p>
        {error ? <p className="mt-2 text-sm font-semibold text-red-600">{error}</p> : null}
      </div>

      <div className="grid gap-3">
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Compression Result</p>
          {stats ? (
            <div className="mt-2 text-sm">
              <p>Input GIF: {formatBytes(stats.input)}</p>
              <p>Compressed: {formatBytes(stats.output)}</p>
              <p className="font-semibold text-brand">
                Saved: {formatBytes(stats.saved)} ({stats.ratio.toFixed(1)}%)
              </p>
            </div>
          ) : (
            <p className="mt-2 text-sm text-muted">Compress GIF to view size savings.</p>
          )}
        </article>
      </div>

      {(inputUrl || outputUrl) ? (
        <div className="lg:col-span-2 grid gap-4 lg:grid-cols-2">
          <article className="rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-6">
            <h3 className="text-lg font-semibold sm:text-xl">Original GIF</h3>
            <div className="mt-3 overflow-hidden rounded-2xl border border-line bg-white">
              {inputUrl ? (
                <Image
                  src={inputUrl}
                  alt="Original GIF preview"
                  width={960}
                  height={540}
                  unoptimized
                  className="h-auto w-full"
                />
              ) : (
                <div className="p-6 text-sm text-muted">No GIF uploaded.</div>
              )}
            </div>
          </article>
          <article className="rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-6">
            <h3 className="text-lg font-semibold sm:text-xl">Compressed GIF</h3>
            <div className="mt-3 overflow-hidden rounded-2xl border border-line bg-white">
              {outputUrl ? (
                <Image
                  src={outputUrl}
                  alt="Compressed GIF preview"
                  width={960}
                  height={540}
                  unoptimized
                  className="h-auto w-full"
                />
              ) : (
                <div className="p-6 text-sm text-muted">No compressed output yet.</div>
              )}
            </div>
          </article>
        </div>
      ) : null}
    </section>
  );
}
