"use client";

import React from "react";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
  align?: "left" | "center" | "right";
  className?: string;
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField?: keyof T;
  sortKey?: string;
  sortDirection?: "asc" | "desc";
  onSort?: (key: string) => void;
  isRowDimmed?: (row: T) => boolean;
  emptyMessage?: string;
  className?: string;
}

export function Table<T extends Record<string, any>>({
  columns,
  data,
  keyField = "id" as keyof T,
  sortKey,
  sortDirection,
  onSort,
  isRowDimmed,
  emptyMessage = "No records found.",
  className = "",
}: TableProps<T>) {
  return (
    <div className={`w-full overflow-hidden rounded-xl border border-border-subtle bg-surface-card ${className}`}>
      {/* Desktop & Tablet Table */}
      <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Data table">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-surface-container-low border-b border-border-subtle sticky top-0 z-10">
            <tr>
              {columns.map((col) => {
                const isSorted = sortKey === col.key;
                const alignClass =
                  col.align === "right"
                    ? "text-right"
                    : col.align === "center"
                    ? "text-center"
                    : "text-left";

                return (
                  <th
                    key={col.key}
                    onClick={() => col.sortable && onSort?.(col.key)}
                    className={`
                      px-4 py-3 font-geist font-semibold uppercase tracking-wider text-[11px] text-content-secondary select-none
                      ${alignClass}
                      ${col.sortable ? "cursor-pointer hover:text-content-primary" : ""}
                      ${col.className || ""}
                    `}
                  >
                    <div
                      className={`inline-flex items-center gap-1.5 ${
                        col.align === "right" ? "justify-end" : ""
                      }`}
                    >
                      <span>{col.header}</span>
                      {col.sortable && (
                        <span className="text-content-muted">
                          {isSorted ? (
                            sortDirection === "asc" ? (
                              <ArrowUp className="w-3 h-3 text-primary" />
                            ) : (
                              <ArrowDown className="w-3 h-3 text-primary" />
                            )
                          ) : (
                            <ArrowUpDown className="w-3 h-3 opacity-40 hover:opacity-100" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle/50">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-8 text-center text-content-muted font-sans"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, idx) => {
                const dimmed = isRowDimmed ? isRowDimmed(row) : false;
                const rowKey = row[keyField] !== undefined ? String(row[keyField]) : String(idx);

                return (
                  <tr
                    key={rowKey}
                    className={`
                      transition-colors duration-150 hover:bg-surface-container/60
                      ${dimmed ? "opacity-40 grayscale-[40%]" : "text-content-primary"}
                    `}
                  >
                    {columns.map((col) => {
                      const alignClass =
                        col.align === "right"
                          ? "text-right"
                          : col.align === "center"
                          ? "text-center"
                          : "text-left";

                      return (
                        <td
                          key={col.key}
                          className={`px-4 py-3 font-sans tabular-nums ${alignClass} ${
                            col.className || ""
                          }`}
                        >
                          {col.render ? col.render(row) : row[col.key]}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
