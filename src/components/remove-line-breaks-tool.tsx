"use client";

import { useMemo, useState } from "react";

export function RemoveLineBreaksTool() {
  const [input, setInput] = useState("");
  const [replacement, setReplacement] = useState(" ");
  const [collapseSpaces, setCollapseSpaces] = useState(true);
  const [trimResult, setTrimResult] = useState(true);
  const [copied, setCopied] = useState(false);

  const output = useMemo(() => {
    let next = input.replace(/\r?\n+/g, replacement);
    if (collapseSpaces) {
      next = next.replace(/\s{2,}/g, " ");
    }
    if (trimResult) {
      next = next.trim();
    }
    return next;
  }, [collapseSpaces, input, replacement, trimResult]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
      <div className="rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold sm:text-2xl">Remove Line Breaks</h2>
          <button
            type="button"
            onClick={() => setInput("")}
            className="rounded-lg border border-line px-3 py-2 text-xs font-semibold text-muted transition hover:border-brand hover:text-brand"
          >
            Clear
          </button>
        </div>
        <p className="mt-2 text-sm text-muted">
          Convert multiline text into a single line or custom-separated format.
        </p>

        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Paste multiline text here..."
          className="mt-4 h-64 w-full resize-y rounded-2xl border border-line bg-white px-4 py-3 text-sm leading-6 text-foreground outline-none transition focus:border-brand sm:h-80 sm:text-base"
        />
      </div>

      <div className="grid gap-3">
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Options</p>
          <label className="mt-2 grid gap-1">
            <span className="text-sm font-semibold text-foreground">Replace Line Breaks With</span>
            <input
              type="text"
              value={replacement}
              onChange={(event) => setReplacement(event.target.value)}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            />
          </label>
          <label className="mt-3 flex items-center gap-2 text-sm text-muted">
            <input
              type="checkbox"
              checked={collapseSpaces}
              onChange={(event) => setCollapseSpaces(event.target.checked)}
            />
            Collapse multiple spaces
          </label>
          <label className="mt-2 flex items-center gap-2 text-sm text-muted">
            <input
              type="checkbox"
              checked={trimResult}
              onChange={(event) => setTrimResult(event.target.checked)}
            />
            Trim result
          </label>
        </article>

        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Output</p>
            <button
              type="button"
              onClick={copy}
              className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-muted transition hover:border-brand hover:text-brand"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <textarea
            value={output}
            readOnly
            className="mt-2 h-48 w-full resize-y rounded-xl border border-line bg-white px-3 py-2 text-sm leading-6 text-foreground"
          />
        </article>
      </div>
    </section>
  );
}
