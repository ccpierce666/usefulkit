"use client";

import { useCallback, useMemo, useState } from "react";

const AUTO_PROCESS_MAX_LINES = 5000;
const RECOMMENDED_MAX_LINES = 50000;
const ABSOLUTE_MAX_LINES = 120000;

function buildFormattedText(
  rawText: string,
  suffix: string,
  skipEmpty: boolean,
  avoidDuplicateSuffix: boolean,
  wrapMode: "none" | "single" | "double" | "backtick",
  dedupe: boolean,
): string {
  const lines = rawText.split(/\r?\n/);
  const output: string[] = [];
  const seen = new Set<string>();

  for (const line of lines) {
    const trimmed = line.trim();
    if (skipEmpty && trimmed.length === 0) {
      continue;
    }
    if (trimmed.length === 0) {
      output.push("");
      continue;
    }

    if (dedupe) {
      if (seen.has(trimmed)) {
        continue;
      }
      seen.add(trimmed);
    }

    const quote =
      wrapMode === "single"
        ? "'"
        : wrapMode === "double"
          ? '"'
          : wrapMode === "backtick"
            ? "`"
            : "";
    const normalized = quote ? `${quote}${trimmed}${quote}` : trimmed;

    if (suffix.length === 0) {
      output.push(normalized);
      continue;
    }

    if (avoidDuplicateSuffix && normalized.endsWith(suffix)) {
      output.push(normalized);
      continue;
    }

    output.push(`${normalized}${suffix}`);
  }

  return output.join("\n");
}

export function IdListFormatterTool() {
  const [rawText, setRawText] = useState("");
  const [suffix, setSuffix] = useState(",");
  const [skipEmpty, setSkipEmpty] = useState(true);
  const [avoidDuplicateSuffix, setAvoidDuplicateSuffix] = useState(true);
  const [wrapMode, setWrapMode] = useState<"none" | "single" | "double" | "backtick">("none");
  const [dedupe, setDedupe] = useState(false);
  const [manualFormattedText, setManualFormattedText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastProcessedFingerprint, setLastProcessedFingerprint] = useState("");
  const [copied, setCopied] = useState(false);

  const inputCount = useMemo(() => {
    return rawText.split(/\r?\n/).filter((line) => line.trim().length > 0).length;
  }, [rawText]);

  const fingerprint = useMemo(
    () =>
      JSON.stringify({
        rawText,
        suffix,
        skipEmpty,
        avoidDuplicateSuffix,
        wrapMode,
        dedupe,
      }),
    [avoidDuplicateSuffix, dedupe, rawText, skipEmpty, suffix, wrapMode],
  );
  const manualMode = inputCount > AUTO_PROCESS_MAX_LINES;
  const tooLarge = inputCount > ABSOLUTE_MAX_LINES;
  const hardLimitMessage = tooLarge
    ? `Input exceeds hard limit (${ABSOLUTE_MAX_LINES.toLocaleString()} lines). Please split into smaller batches.`
    : "";
  const autoFormattedText = useMemo(() => {
    if (manualMode || tooLarge) {
      return "";
    }
    return buildFormattedText(rawText, suffix, skipEmpty, avoidDuplicateSuffix, wrapMode, dedupe);
  }, [avoidDuplicateSuffix, dedupe, manualMode, rawText, skipEmpty, suffix, tooLarge, wrapMode]);
  const formattedText = manualMode || tooLarge ? manualFormattedText : autoFormattedText;
  const outputCount = useMemo(() => {
    if (!formattedText) {
      return 0;
    }
    return formattedText.split(/\r?\n/).filter((line) => line.trim().length > 0).length;
  }, [formattedText]);
  const isStale = manualMode && lastProcessedFingerprint !== fingerprint;

  const runFormat = useCallback(() => {
    if (tooLarge) {
      return;
    }
    setIsProcessing(true);
    setTimeout(() => {
      const next = buildFormattedText(
        rawText,
        suffix,
        skipEmpty,
        avoidDuplicateSuffix,
        wrapMode,
        dedupe,
      );
      setManualFormattedText(next);
      setLastProcessedFingerprint(fingerprint);
      setIsProcessing(false);
    }, 0);
  }, [avoidDuplicateSuffix, dedupe, fingerprint, rawText, skipEmpty, suffix, tooLarge, wrapMode]);

  const copyOutput = async () => {
    try {
      await navigator.clipboard.writeText(formattedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
      <div className="rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-6">
        <h2 className="text-xl font-semibold sm:text-2xl">Input IDs</h2>
        <p className="mt-2 text-sm text-muted">
          Paste IDs with one item per line. We&apos;ll append the suffix at the end of each line.
        </p>

        <textarea
          value={rawText}
          onChange={(event) => setRawText(event.target.value)}
          placeholder={"10001\n10002\n10003"}
          className="mt-4 h-64 w-full resize-y rounded-2xl border border-line bg-white px-4 py-3 text-sm leading-6 text-foreground outline-none transition focus:border-brand sm:h-80 sm:text-base"
        />
      </div>

      <div className="grid gap-3">
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Suffix Symbol</p>
          <input
            type="text"
            value={suffix}
            onChange={(event) => setSuffix(event.target.value)}
            placeholder=","
            className="mt-2 h-10 w-full rounded-lg border border-line bg-white px-3 text-sm outline-none transition focus:border-brand"
          />
          <div className="mt-2 flex flex-wrap gap-2">
            {[
              { label: "Comma (,)", value: "," },
              { label: "Semicolon (;)", value: ";" },
              { label: "None", value: "" },
            ].map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => setSuffix(item.value)}
                className="rounded-md border border-line px-2 py-1 text-[11px] font-semibold text-muted transition hover:border-brand hover:text-brand"
              >
                {item.label}
              </button>
            ))}
          </div>
          <label className="mt-3 grid gap-1 text-xs text-muted">
            Wrap each line
            <select
              value={wrapMode}
              onChange={(event) =>
                setWrapMode(event.target.value as "none" | "single" | "double" | "backtick")
              }
              className="h-9 rounded-lg border border-line bg-white px-2 text-xs outline-none transition focus:border-brand sm:text-sm"
            >
              <option value="none">None</option>
              <option value="single">Single quote (&apos;id&apos;)</option>
              <option value="double">Double quote (&quot;id&quot;)</option>
              <option value="backtick">Backtick (`id`)</option>
            </select>
          </label>
          <label className="mt-3 flex items-center gap-2 text-xs text-muted">
            <input
              type="checkbox"
              checked={skipEmpty}
              onChange={(event) => setSkipEmpty(event.target.checked)}
            />
            Skip empty lines
          </label>
          <label className="mt-2 flex items-center gap-2 text-xs text-muted">
            <input
              type="checkbox"
              checked={dedupe}
              onChange={(event) => setDedupe(event.target.checked)}
            />
            Remove duplicate IDs
          </label>
          <label className="mt-2 flex items-center gap-2 text-xs text-muted">
            <input
              type="checkbox"
              checked={avoidDuplicateSuffix}
              onChange={(event) => setAvoidDuplicateSuffix(event.target.checked)}
            />
            Avoid duplicate suffix
          </label>
          <div className="mt-3 rounded-lg border border-line bg-white p-2 text-xs text-muted">
            Real-time mode up to {AUTO_PROCESS_MAX_LINES.toLocaleString()} lines.
            <br />
            Recommended up to {RECOMMENDED_MAX_LINES.toLocaleString()} lines.
          </div>
          {manualMode ? (
            <button
              type="button"
              onClick={runFormat}
              disabled={isProcessing || tooLarge}
              className="mt-3 rounded-lg border border-line px-3 py-2 text-xs font-semibold text-muted transition hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isProcessing ? "Processing..." : "Process Large Batch"}
            </button>
          ) : null}
          {hardLimitMessage ? (
            <p className="mt-2 text-xs font-semibold text-red-600">{hardLimitMessage}</p>
          ) : null}
          {isStale ? (
            <p className="mt-2 text-xs font-semibold text-amber-600">
              Input changed. Click &quot;Process Large Batch&quot; to refresh output.
            </p>
          ) : null}
        </article>

        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Formatted Output</p>
            <button
              type="button"
              onClick={copyOutput}
              className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-muted transition hover:border-brand hover:text-brand"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <textarea
            value={formattedText}
            readOnly
            className="mt-2 h-44 w-full resize-y rounded-xl border border-line bg-white px-3 py-2 text-sm leading-6 text-foreground"
          />
        </article>

        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Stats</p>
          <p className="mt-2 text-sm text-foreground">Input lines: {inputCount}</p>
          <p className="mt-1 text-sm text-foreground">Output lines: {outputCount}</p>
        </article>
      </div>
    </section>
  );
}
