"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { categoryLabels, tools } from "@/lib/tools";

type ToolSearchProps = {
  autoFocus?: boolean;
  onSelect?: () => void;
};

export function ToolSearch({ autoFocus = false, onSelect }: ToolSearchProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const keyword = query.trim().toLowerCase();
  const results = useMemo(() => {
    if (!keyword) return [];
    return tools
      .filter((tool) => {
        const haystack = `${tool.name} ${tool.summary} ${tool.keyword} ${categoryLabels[tool.category]}`.toLowerCase();
        return haystack.includes(keyword);
      })
      .slice(0, 8);
  }, [keyword]);

  return (
    <div className="relative w-full">
      <label className="sr-only" htmlFor="tool-search-input">
        Search tools
      </label>
      <input
        id="tool-search-input"
        ref={inputRef}
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search tools (e.g. tax, md5, subscription)"
        className="h-10 w-full rounded-xl border border-line bg-white px-3 text-sm outline-none transition focus:border-brand"
      />
      {keyword ? (
        <div className="absolute left-0 right-0 top-12 z-30 overflow-hidden rounded-xl border border-line bg-white shadow-lg">
          {results.length > 0 ? (
            <ul className="max-h-80 overflow-auto py-1">
              {results.map((tool) => (
                <li key={tool.slug}>
                  <Link
                    href={`/tools/${tool.slug}`}
                    onClick={() => {
                      setQuery("");
                      onSelect?.();
                    }}
                    className="block px-3 py-2 text-sm transition hover:bg-slate-50"
                  >
                    <p className="font-semibold text-foreground">{tool.name}</p>
                    <p className="text-xs text-muted">{categoryLabels[tool.category]}</p>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-3 py-3 text-sm text-muted">
              No tools found for &quot;{query.trim()}&quot;.
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
