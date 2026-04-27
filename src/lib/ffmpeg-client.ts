"use client";

type FfmpegLike = {
  load: (options: { coreURL: string; wasmURL: string; workerURL: string }) => Promise<void>;
  writeFile: (path: string, data: Uint8Array) => Promise<void>;
  readFile: (path: string) => Promise<Uint8Array>;
  exec: (args: string[]) => Promise<number>;
  deleteFile: (path: string) => Promise<void>;
};

const CORE_VERSION = "0.12.10";
const BASE_URL = `https://cdn.jsdelivr.net/npm/@ffmpeg/core@${CORE_VERSION}/dist/esm`;

let ffmpeg: FfmpegLike | null = null;
let loadingPromise: Promise<FfmpegLike> | null = null;

export async function ensureFfmpegLoaded(): Promise<FfmpegLike> {
  if (ffmpeg) return ffmpeg;
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    const [{ FFmpeg }, { toBlobURL }] = await Promise.all([
      import("@ffmpeg/ffmpeg"),
      import("@ffmpeg/util"),
    ]);

    const instance = new FFmpeg() as unknown as FfmpegLike;
    await instance.load({
      coreURL: await toBlobURL(`${BASE_URL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(`${BASE_URL}/ffmpeg-core.wasm`, "application/wasm"),
      workerURL: await toBlobURL(`${BASE_URL}/ffmpeg-core.worker.js`, "text/javascript"),
    });

    ffmpeg = instance;
    return instance;
  })().catch((error) => {
    loadingPromise = null;
    throw error;
  });

  return loadingPromise;
}

export async function toFfmpegInput(file: File): Promise<Uint8Array> {
  const { fetchFile } = await import("@ffmpeg/util");
  return (await fetchFile(file)) as Uint8Array;
}

export async function safeDeleteFile(engine: FfmpegLike, path: string) {
  try {
    await engine.deleteFile(path);
  } catch {
    // Ignore cleanup failures from missing temporary files.
  }
}

