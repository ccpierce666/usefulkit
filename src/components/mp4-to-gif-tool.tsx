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

export function Mp4ToGifTool() {
  const [file, setFile] = useState<File | null>(null);
  const [fps, setFps] = useState(12);
  const [width, setWidth] = useState(480);
  const [duration, setDuration] = useState(6);
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
    const delta = outputBlob.size - file.size;
    const ratio = file.size > 0 ? (delta / file.size) * 100 : 0;
    return { input: file.size, output: outputBlob.size, delta, ratio };
  }, [file, outputBlob]);

  async function convert() {
    if (!file) {
      setError("Please upload MP4 first.");
      return;
    }
    if (file.size > 60 * 1024 * 1024) {
      setError("For browser stability, please keep MP4 files under 60MB.");
      return;
    }

    setError("");
    setIsProcessing(true);
    try {
      setEngineState("loading");
      const ffmpeg = await ensureFfmpegLoaded();
      setEngineState("ready");

      const inputName = "input.mp4";
      const paletteName = "palette.png";
      const outputName = "output.gif";

      await ffmpeg.writeFile(inputName, await toFfmpegInput(file));
      await ffmpeg.exec([
        "-i",
        inputName,
        "-t",
        `${duration}`,
        "-vf",
        `fps=${fps},scale=${width}:-1:flags=lanczos,palettegen`,
        paletteName,
      ]);
      await ffmpeg.exec([
        "-i",
        inputName,
        "-i",
        paletteName,
        "-t",
        `${duration}`,
        "-lavfi",
        `fps=${fps},scale=${width}:-1:flags=lanczos[x];[x][1:v]paletteuse`,
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
      setError("MP4 to GIF conversion failed. Try smaller width or shorter duration.");
    } finally {
      setIsProcessing(false);
    }
  }

  function download() {
    if (!outputUrl || !file) return;
    const base = file.name.replace(/\.[^/.]+$/, "");
    const anchor = document.createElement("a");
    anchor.href = outputUrl;
    anchor.download = `${base}.gif`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  }

  return (
    <section className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
      <div className="rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-6">
        <h2 className="text-xl font-semibold sm:text-2xl">MP4 to GIF</h2>
        <p className="mt-2 text-sm text-muted">
          Convert short videos into shareable GIFs for social posts, chats, and support docs.
        </p>

        <label className="mt-4 grid gap-2">
          <span className="text-sm font-semibold text-foreground">Upload MP4</span>
          <input
            type="file"
            accept="video/mp4,.mp4"
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
            <span className="text-sm font-semibold text-foreground">Width ({width}px)</span>
            <input
              type="range"
              min={240}
              max={900}
              step={20}
              value={width}
              onChange={(event) => setWidth(Number(event.target.value))}
            />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-foreground">Duration ({duration}s)</span>
            <input
              type="range"
              min={2}
              max={12}
              value={duration}
              onChange={(event) => setDuration(Number(event.target.value))}
            />
          </label>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void convert()}
            disabled={!file || isProcessing}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isProcessing ? "Converting..." : "Convert to GIF"}
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
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Result</p>
          {stats ? (
            <div className="mt-2 text-sm">
              <p>Input MP4: {formatBytes(stats.input)}</p>
              <p>Output GIF: {formatBytes(stats.output)}</p>
              <p className={`font-semibold ${stats.delta <= 0 ? "text-brand" : "text-amber-600"}`}>
                Size change: {stats.delta > 0 ? "+" : ""}
                {formatBytes(stats.delta)} ({stats.ratio > 0 ? "+" : ""}
                {stats.ratio.toFixed(1)}%)
              </p>
            </div>
          ) : (
            <p className="mt-2 text-sm text-muted">Convert to compare size.</p>
          )}
        </article>
      </div>

      {(inputUrl || outputUrl) ? (
        <div className="lg:col-span-2 grid gap-4 lg:grid-cols-2">
          <article className="rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-6">
            <h3 className="text-lg font-semibold sm:text-xl">Input MP4</h3>
            <div className="mt-3 overflow-hidden rounded-2xl border border-line bg-white p-2">
              {inputUrl ? (
                <video src={inputUrl} controls className="h-auto w-full rounded-lg" />
              ) : (
                <div className="p-6 text-sm text-muted">No MP4 uploaded.</div>
              )}
            </div>
          </article>
          <article className="rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-6">
            <h3 className="text-lg font-semibold sm:text-xl">Output GIF</h3>
            <div className="mt-3 overflow-hidden rounded-2xl border border-line bg-white">
              {outputUrl ? (
                <Image
                  src={outputUrl}
                  alt="GIF output preview"
                  width={960}
                  height={540}
                  unoptimized
                  className="h-auto w-full"
                />
              ) : (
                <div className="p-6 text-sm text-muted">No GIF output yet.</div>
              )}
            </div>
          </article>
        </div>
      ) : null}
    </section>
  );
}
