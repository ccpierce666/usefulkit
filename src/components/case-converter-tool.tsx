"use client";

import { useMemo, useState } from "react";

type Mode = "upper" | "lower" | "title" | "sentence";

function toTitleCase(text: string): string {
  return text.toLowerCase().replace(/\b([a-z])/g, (m) => m.toUpperCase());
}

function toSentenceCase(text: string): string {
  const lower = text.toLowerCase();
  return lower.replace(/(^\s*[a-z])|([.!?]\s+[a-z])/g, (m) => m.toUpperCase());
}

export function CaseConverterTool() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<Mode>("title");
  const [copied, setCopied] = useState(false);

  const output = useMemo(() => {
    if (mode === "upper") return input.toUpperCase();
    if (mode === "lower") return input.toLowerCase();
    if (mode === "sentence") return toSentenceCase(input);
    return toTitleCase(input);
  }, [input, mode]);

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
          <h2 className="text-xl font-semibold sm:text-2xl">Case Converter</h2>
          <button
            type="button"
            onClick={() => setInput("")}
            className="rounded-lg border border-line px-3 py-2 text-xs font-semibold text-muted transition hover:border-brand hover:text-brand"
          >
            Clear
          </button>
        </div>
        <p className="mt-2 text-sm text-muted">Convert text casing for content, docs, and code snippets.</p>

        <div className="mt-4 flex flex-wrap gap-2">
          {[
            { id: "upper", label: "UPPERCASE" },
            { id: "lower", label: "lowercase" },
            { id: "title", label: "Title Case" },
            { id: "sentence", label: "Sentence case" },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setMode(item.id as Mode)}
              className={`rounded-md border px-2 py-1 text-xs font-semibold transition ${
                mode === item.id
                  ? "border-brand bg-brand/10 text-brand"
                  : "border-line text-muted hover:border-brand hover:text-brand"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Type or paste text to convert..."
          className="mt-4 h-64 w-full resize-y rounded-2xl border border-line bg-white px-4 py-3 text-sm leading-6 text-foreground outline-none transition focus:border-brand sm:h-80 sm:text-base"
        />
      </div>

      <div className="grid gap-3">
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Converted Text</p>
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
            className="mt-2 h-52 w-full resize-y rounded-xl border border-line bg-white px-3 py-2 text-sm leading-6 text-foreground"
          />
        </article>

        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Stats</p>
          <p className="mt-2 text-sm text-foreground">Characters: {output.length.toLocaleString()}</p>
          <p className="mt-1 text-sm text-foreground">
            Words: {(output.trim() ? output.trim().split(/\s+/).length : 0).toLocaleString()}
          </p>
        </article>
      </div>
    </section>
  );
}
