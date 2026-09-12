/**
 * Utilitários de exportação CSV/JSON — sem dependências.
 *
 * CSV: separador ";" + BOM UTF-8 + CRLF, para abrir com colunas já separadas
 * no Excel em português. Números vão no formato pt-BR (vírgula decimal) e
 * datas em DD/MM/AAAA quando formatados pelos helpers.
 */

export interface CsvColumn<T> {
  key: keyof T | string;
  label: string;
  /** Formata a célula. Se ausente, usa String(valor ?? ""). */
  format?: (row: T) => string | number | null | undefined;
}

function escapeCell(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  if (/[";\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

/** Gera a string CSV (com BOM) a partir de linhas + definição de colunas. */
export function toCSV<T>(rows: T[], columns: CsvColumn<T>[]): string {
  const header = columns.map((c) => escapeCell(c.label)).join(";");
  const body = rows.map((row) =>
    columns
      .map((c) => {
        const raw = c.format
          ? c.format(row)
          : (row as Record<string, unknown>)[c.key as string];
        return escapeCell(raw as string | number | null | undefined);
      })
      .join(";")
  );
  return "﻿" + [header, ...body].join("\r\n");
}

/** Número no formato brasileiro: 1234.5 -> "1.234,50" (2 casas). */
export function csvNumber(value: number | string | null | undefined): string {
  const n = typeof value === "string" ? parseFloat(value) : value;
  if (n === null || n === undefined || Number.isNaN(n)) return "";
  return n.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Data ISO (YYYY-MM-DD) -> "DD/MM/AAAA". Aceita datetime também. */
export function csvDate(value: string | null | undefined): string {
  if (!value) return "";
  const iso = value.length >= 10 ? value.slice(0, 10) : value;
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return value;
  return `${d}/${m}/${y}`;
}

/** Dispara o download de um arquivo .csv no navegador. */
export function downloadCSV(filename: string, csv: string): void {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  triggerDownload(filename, blob);
}

/** Dispara o download de um objeto como .json. */
export function downloadJSON(filename: string, data: unknown): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json;charset=utf-8;",
  });
  triggerDownload(filename, blob);
}

function triggerDownload(filename: string, blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Sufixo de data para nomes de arquivo: 2026-09-09. */
export function fileDateSuffix(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}
