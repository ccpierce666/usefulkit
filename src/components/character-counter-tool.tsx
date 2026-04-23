"use client";

import { useMemo, useState } from "react";

export function CharacterCounterTool() {
  const [text, setText] = useState("");

  const stats = useMemo(() => {
    const trimmed = text.trim();
    const words = trimmed ? trimmed.split(/\s+/).length : 0;
    const characters = text.length;
    const noSpaces = text.replace(/\s/g, "").length;
    const lines = text.length === 0 ? 0 : text.split(/\r?\n/).length;
    const sentences = trimmed ? trimmed.split(/[.!?]+/).filter(Boolean).length : 0;
    return { words, characters, noSpaces, lines, sentences };
  }, [text]);

  return (
    <section className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
      <div className="rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold sm:text-2xl">Character Counter</h2>
          <button
            type="button"
            onClick={() => setText("")}
            className="rounded-lg border border-line px-3 py-2 text-xs font-semibold text-muted transition hover:border-brand hover:text-brand"
          >
            Clear
          </button>
        </div>
        <p className="mt-2 text-sm text-muted">
          Count characters, words, lines, and sentences instantly.
        </p>
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Type or paste your content here..."
          className="mt-4 h-64 w-full resize-y rounded-2xl border border-line bg-white px-4 py-3 text-sm leading-6 text-foreground outline-none transition focus:border-brand sm:h-80 sm:text-base"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Characters</p>
          <p className="mt-2 text-3xl font-bold">{stats.characters.toLocaleString()}</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Characters (No Spaces)
          </p>
          <p className="mt-2 text-3xl font-bold">{stats.noSpaces.toLocaleString()}</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Words</p>
          <p className="mt-2 text-3xl font-bold">{stats.words.toLocaleString()}</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Lines</p>
          <p className="mt-2 text-3xl font-bold">{stats.lines.toLocaleString()}</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Sentences</p>
          <p className="mt-2 text-3xl font-bold">{stats.sentences.toLocaleString()}</p>
        </article>
      </div>
    </section>
  );
}
