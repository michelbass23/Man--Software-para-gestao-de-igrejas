"use client";

import { cn } from "@/lib/utils";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  type: "entry" | "expense";
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
  actions?: (item: T) => React.ReactNode;
}

export default function DataTable<T extends { id: string }>({
  columns,
  data,
  type,
  page,
  totalPages,
  onPageChange,
  isLoading,
  actions,
}: DataTableProps<T>) {
  const isEntry = type === "entry";
  const allColumns = actions
    ? [...columns, { key: "__actions", label: "Ações", className: "text-right" }]
    : columns;

  return (
    <div className="glass-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              {allColumns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-4",
                    col.className
                  )}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-border/50">
                  {allColumns.map((col) => (
                    <td key={col.key} className="px-6 py-4">
                      <div className="skeleton h-4 w-full" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={allColumns.length}
                  className="px-6 py-12 text-center"
                >
                  <div className="flex flex-col items-center gap-2">
                    {isEntry ? (
                      <ArrowDownLeft className="w-8 h-8 text-zinc-600" />
                    ) : (
                      <ArrowUpRight className="w-8 h-8 text-zinc-600" />
                    )}
                    <p className="text-zinc-500 text-sm">
                      Nenhum lançamento encontrado
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr
                  key={item.id}
                  className="border-b border-border/50 hover:bg-white/[0.02] transition-colors opacity-0 animate-fade-in"
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn("px-6 py-4 text-sm", col.className)}
                    >
                      {col.render
                        ? col.render(item)
                        : (item as Record<string, unknown>)[col.key]?.toString()}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {actions(item)}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-border">
          <p className="text-zinc-500 text-sm">
            Página {page} de {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="p-2 rounded-lg border border-border text-zinc-400 hover:text-zinc-200 hover:border-border-light disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="p-2 rounded-lg border border-border text-zinc-400 hover:text-zinc-200 hover:border-border-light disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
