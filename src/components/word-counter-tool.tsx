"use client";

import { useMemo, useState } from "react";

function formatDuration(minutes: number): string {
  if (minutes < 1) {
    return `${Math.max(1, Math.round(minutes * 60))} sec`;
  }
  if (minutes < 60) {
    return `${minutes.toFixed(1)} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remaining = Math.round(minutes % 60);
  return remaining > 0 ? `${hours}h ${remaining}m` : `${hours}h`;
}

export function WordCounterTool() {
  const [text, setText] = useState("");

  const stats = useMemo(() => {
    const cleanText = text.trim();
    const words = cleanText ? cleanText.split(/\s+/).length : 0;
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, "").length;
    const sentences = cleanText ? cleanText.split(/[.!?]+/).filter(Boolean).length : 0;
    const paragraphs = cleanText ? cleanText.split(/\n\s*\n/).filter(Boolean).length : 0;
    const readingMinutes = words / 225;
    const speakingMinutes = words / 130;

    return {
      words,
      characters,
      charactersNoSpaces,
      sentences,
      paragraphs,
      readingMinutes,
      speakingMinutes,
    };
  }, [text]);

  return (
    <section className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
      <div className="rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold sm:text-2xl">Text Input</h2>
          <button
            type="button"
            className="rounded-lg border border-line px-3 py-2 text-xs font-semibold text-muted transition hover:border-brand hover:text-brand"
            onClick={() => setText("")}
          >
            Clear
          </button>
        </div>
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Paste or type your text here..."
          className="mt-4 h-64 w-full resize-y rounded-2xl border border-line bg-white px-4 py-3 text-sm leading-6 text-foreground outline-none transition focus:border-brand sm:h-80 sm:text-base"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Words</p>
          <p className="mt-2 text-3xl font-bold">{stats.words.toLocaleString()}</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Characters</p>
          <p className="mt-2 text-3xl font-bold">{stats.characters.toLocaleString()}</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Characters (No Spaces)
          </p>
          <p className="mt-2 text-3xl font-bold">{stats.charactersNoSpaces.toLocaleString()}</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Sentences</p>
          <p className="mt-2 text-3xl font-bold">{stats.sentences.toLocaleString()}</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Paragraphs</p>
          <p className="mt-2 text-3xl font-bold">{stats.paragraphs.toLocaleString()}</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Reading Time</p>
          <p className="mt-2 text-2xl font-bold">{formatDuration(stats.readingMinutes)}</p>
          <p className="mt-1 text-xs text-muted">Based on 225 words per minute.</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Speaking Time</p>
          <p className="mt-2 text-2xl font-bold">{formatDuration(stats.speakingMinutes)}</p>
          <p className="mt-1 text-xs text-muted">Based on 130 words per minute.</p>
        </article>
      </div>
    </section>
  );
}
