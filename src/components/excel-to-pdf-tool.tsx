"use client";

import { useMemo, useState } from "react";

const MAX_ROWS = 2000;
const MAX_COLS = 30;
const PREVIEW_ROWS = 8;

type SheetData = {
  name: string;
  rows: string[][];
  truncatedRows: boolean;
  truncatedCols: boolean;
};

function formatNumber(value: number): string {
  return value.toLocaleString("en-US");
}

function safeCell(value: unknown): string {
  if (value == null) return "";
  const text = String(value).replace(/\s+/g, " ").trim();
  return text.length > 120 ? `${text.slice(0, 117)}...` : text;
}

export function ExcelToPdfTool() {
  const [fileName, setFileName] = useState("");
  const [sheets, setSheets] = useState<SheetData[]>([]);
  const [selectedSheet, setSelectedSheet] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState("");
  const [exportInfo, setExportInfo] = useState<{ pages: number; rows: number } | null>(null);

  const activeSheet = useMemo(
    () => sheets.find((sheet) => sheet.name === selectedSheet) ?? null,
    [selectedSheet, sheets],
  );

  const totalRows = useMemo(
    () => sheets.reduce((sum, sheet) => sum + sheet.rows.length, 0),
    [sheets],
  );

  async function loadWorkbook(file: File) {
    setIsLoading(true);
    setError("");
    setSheets([]);
    setSelectedSheet("");
    setExportInfo(null);
    setFileName(file.name);

    try {
      const XLSX = await import("xlsx");
      const bytes = await file.arrayBuffer();
      const workbook = XLSX.read(bytes, { type: "array", cellDates: true, raw: false });

      const parsedSheets: SheetData[] = workbook.SheetNames.map((sheetName) => {
        const worksheet = workbook.Sheets[sheetName];
        const matrix = XLSX.utils.sheet_to_json<(string | number | boolean | null)[]>(worksheet, {
          header: 1,
          defval: "",
          blankrows: false,
          raw: false,
        });

        const truncatedRows = matrix.length > MAX_ROWS;
        const trimmedRows = matrix.slice(0, MAX_ROWS).map((row) => row.slice(0, MAX_COLS));
        const truncatedCols = matrix.some((row) => row.length > MAX_COLS);
        const rows = trimmedRows.map((row) => row.map((cell) => safeCell(cell)));

        return {
          name: sheetName,
          rows,
          truncatedRows,
          truncatedCols,
        };
      }).filter((sheet) => sheet.rows.length > 0);

      if (!parsedSheets.length) {
        setError("No readable rows found. Please check your file and try again.");
        return;
      }

      setSheets(parsedSheets);
      setSelectedSheet(parsedSheets[0].name);
    } catch {
      setError("Failed to read this file. Please upload a valid .xlsx or .csv file.");
    } finally {
      setIsLoading(false);
    }
  }

  async function exportPdf() {
    if (!activeSheet || activeSheet.rows.length === 0) {
      setError("Please upload a file and choose a valid sheet first.");
      return;
    }

    try {
      setIsExporting(true);
      setError("");
      setExportInfo(null);

      const { default: JsPdf } = await import("jspdf");
      const autoTableModule = await import("jspdf-autotable");
      const autoTable = autoTableModule.default;

      const sourceRows = activeSheet.rows;
      const firstRow = sourceRows[0] ?? [];
      const hasHeader = firstRow.some((item) => item.length > 0);
      const header = hasHeader
        ? firstRow.map((item, idx) => item || `Column ${idx + 1}`)
        : firstRow.map((_, idx) => `Column ${idx + 1}`);
      const body = (hasHeader ? sourceRows.slice(1) : sourceRows).map((row) =>
        header.map((_, idx) => row[idx] ?? ""),
      );

      const doc = new JsPdf({
        orientation: header.length > 8 ? "landscape" : "portrait",
        unit: "pt",
        format: "a4",
      });

      doc.setFontSize(12);
      doc.text(`${fileName} - ${activeSheet.name}`, 40, 36);

      autoTable(doc, {
        head: [header],
        body,
        startY: 48,
        margin: { left: 28, right: 28, top: 48, bottom: 36 },
        theme: "grid",
        headStyles: {
          fillColor: [30, 41, 59],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        styles: {
          fontSize: 8,
          cellPadding: 4,
          overflow: "linebreak",
          valign: "top",
        },
      });

      const safeName = fileName.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9-_]/g, "_");
      doc.save(`${safeName}-${activeSheet.name}.pdf`);
      setExportInfo({ pages: doc.getNumberOfPages(), rows: body.length });
    } catch {
      setError("Export failed. Try a smaller sheet or a different file.");
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <section className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
      <div className="rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-6">
        <h2 className="text-xl font-semibold sm:text-2xl">Excel to PDF</h2>
        <p className="mt-2 text-sm text-muted">
          Upload Excel or CSV, choose a sheet, preview rows, and export as a paginated PDF.
        </p>

        <label className="mt-4 block rounded-2xl border border-dashed border-line bg-white p-4 text-sm text-muted">
          <span className="font-semibold text-foreground">Upload .xlsx or .csv</span>
          <input
            type="file"
            accept=".xlsx,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
            className="mt-3 block w-full text-sm"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                void loadWorkbook(file);
              }
            }}
          />
          {fileName ? <span className="mt-2 block text-xs text-foreground">Loaded: {fileName}</span> : null}
        </label>

        {sheets.length > 0 ? (
          <label className="mt-4 grid gap-2 sm:max-w-sm">
            <span className="text-sm font-semibold text-foreground">Worksheet</span>
            <select
              value={selectedSheet}
              onChange={(event) => {
                setSelectedSheet(event.target.value);
                setExportInfo(null);
              }}
              className="h-10 rounded-lg border border-line bg-white px-2 text-sm outline-none transition focus:border-brand"
            >
              {sheets.map((sheet) => (
                <option key={sheet.name} value={sheet.name}>
                  {sheet.name}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        {activeSheet ? (
          <div className="mt-4 rounded-xl border border-line bg-white p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Preview</p>
            <div className="mt-2 overflow-x-auto">
              <table className="w-full min-w-[520px] border-collapse text-left text-xs">
                <tbody>
                  {activeSheet.rows.slice(0, PREVIEW_ROWS).map((row, rowIndex) => (
                    <tr key={`${rowIndex}-${row.join("|")}`}>
                      {row.map((cell, colIndex) => (
                        <td key={`${rowIndex}-${colIndex}`} className="border border-line px-2 py-1 align-top">
                          {cell || "-"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        {error ? <p className="mt-3 text-sm font-semibold text-rose-700">{error}</p> : null}

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void exportPdf()}
            disabled={!activeSheet || isLoading || isExporting}
            className="rounded-xl border border-brand bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isExporting ? "Exporting..." : "Export PDF"}
          </button>
          <p className="self-center text-xs text-muted">All processing runs in your browser.</p>
        </div>
      </div>

      <div className="grid gap-3">
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Sheets</p>
          <p className="mt-2 text-3xl font-bold">{sheets.length}</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Parsed Rows</p>
          <p className="mt-2 text-3xl font-bold">{formatNumber(totalRows)}</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Limits</p>
          <p className="mt-2 text-sm text-foreground">
            Up to {formatNumber(MAX_ROWS)} rows and {formatNumber(MAX_COLS)} columns per sheet.
          </p>
        </article>
        {activeSheet && (activeSheet.truncatedRows || activeSheet.truncatedCols) ? (
          <article className="rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Notice</p>
            <p className="mt-2 text-sm text-amber-800">
              {activeSheet.truncatedRows ? `Rows above ${formatNumber(MAX_ROWS)} were skipped. ` : ""}
              {activeSheet.truncatedCols ? `Columns above ${formatNumber(MAX_COLS)} were skipped.` : ""}
            </p>
          </article>
        ) : null}
        {exportInfo ? (
          <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Last Export</p>
            <p className="mt-2 text-sm text-foreground">
              {formatNumber(exportInfo.rows)} data rows across {formatNumber(exportInfo.pages)} PDF pages.
            </p>
          </article>
        ) : null}
      </div>
    </section>
  );
}
