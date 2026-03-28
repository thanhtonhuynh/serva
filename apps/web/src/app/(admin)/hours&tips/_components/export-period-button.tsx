"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { BreakdownData } from "@serva/shared";
import { Download01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import * as XLSX from "xlsx-js-style";

export type ExportPeriodPayload = {
  periodLabel: string;
  dayHeaders: string[];
  hoursBreakdown: BreakdownData[];
  tipsBreakdown: BreakdownData[];
  monthYearLabel: string;
};

function safeFilenameSegment(s: string): string {
  return (
    s
      .replace(/[^a-zA-Z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") || "period"
  );
}

function escapeCsvCell(value: string | number): string {
  const str = String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/** Format tips (cents) as currency string e.g. "$110.00" */
function formatTipsMoney(cents: number): string {
  const dollars = Math.round(cents) / 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(dollars);
}

function buildCsv(payload: ExportPeriodPayload): string {
  const { periodLabel, dayHeaders, hoursBreakdown, tipsBreakdown } = payload;
  const headerRow = ["Name", ...dayHeaders, "Total"];
  const lines: string[] = [];

  // Hours section
  lines.push(`Hours - ${periodLabel}`);
  lines.push(headerRow.map(escapeCsvCell).join(","));
  for (const row of hoursBreakdown) {
    const cells = [
      row.name,
      ...row.keyData.map((v) => (v > 0 ? v : "")),
      row.total > 0 ? row.total : "",
    ];
    lines.push(cells.map(escapeCsvCell).join(","));
  }
  lines.push("");

  // Tips section
  lines.push(`Tips - ${periodLabel}`);
  lines.push(headerRow.map(escapeCsvCell).join(","));
  for (const row of tipsBreakdown) {
    const cells = [
      row.name,
      ...row.keyData.map((v) => (v > 0 ? formatTipsMoney(v) : "")),
      row.total > 0 ? formatTipsMoney(row.total) : "",
    ];
    lines.push(cells.map(escapeCsvCell).join(","));
  }

  return lines.join("\n");
}

const HEADER_STYLE = {
  font: { bold: true, color: { rgb: "FFFFFFFF" } },
  fill: { fgColor: { rgb: "FF1e40af" }, patternType: "solid" as const },
};

function applyHeaderStyle(ws: XLSX.WorkSheet, rowCount: number, colCount: number): void {
  for (let c = 0; c < colCount; c++) {
    const ref = XLSX.utils.encode_cell({ r: 0, c });
    if (ws[ref]) ws[ref].s = HEADER_STYLE;
  }
  for (let r = 1; r < rowCount; r++) {
    const ref = XLSX.utils.encode_cell({ r, c: 0 });
    if (ws[ref]) ws[ref].s = HEADER_STYLE;
  }
}

function buildExcel(payload: ExportPeriodPayload): ArrayBuffer {
  const { dayHeaders, hoursBreakdown, tipsBreakdown } = payload;
  const headerRow = ["Name", ...dayHeaders, "Total"];

  const wb = XLSX.utils.book_new();

  const hoursData: (string | number)[][] = [headerRow];
  for (const row of hoursBreakdown) {
    hoursData.push([
      row.name,
      ...row.keyData.map((v) => (v > 0 ? v : "")),
      row.total > 0 ? row.total : "",
    ]);
  }
  const wsHours = XLSX.utils.aoa_to_sheet(hoursData);
  applyHeaderStyle(wsHours, hoursData.length, headerRow.length);
  XLSX.utils.book_append_sheet(wb, wsHours, "Hours");

  const tipsData: (string | number)[][] = [headerRow];
  for (const row of tipsBreakdown) {
    tipsData.push([
      row.name,
      ...row.keyData.map((v) => (v > 0 ? formatTipsMoney(v) : "")),
      row.total > 0 ? formatTipsMoney(row.total) : "",
    ]);
  }
  const wsTips = XLSX.utils.aoa_to_sheet(tipsData);
  applyHeaderStyle(wsTips, tipsData.length, headerRow.length);
  XLSX.utils.book_append_sheet(wb, wsTips, "Tips");

  return XLSX.write(wb, { bookType: "xlsx", type: "array" });
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

type ExportPeriodButtonProps = {
  payload: ExportPeriodPayload;
};

export function ExportPeriodButton({ payload }: ExportPeriodButtonProps) {
  const baseName = `Hours-Tips-${safeFilenameSegment(payload.periodLabel)}-${safeFilenameSegment(payload.monthYearLabel)}`;

  function handleExportCsv() {
    const csv = buildCsv(payload);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    downloadBlob(blob, `${baseName}.csv`);
  }

  function handleExportExcel() {
    const arrayBuffer = buildExcel(payload);
    const blob = new Blob([arrayBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    downloadBlob(blob, `${baseName}.xlsx`);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline-accent" size="sm" />}>
        <HugeiconsIcon icon={Download01Icon} className="size-4" />
        Export
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleExportCsv}>Download as CSV</DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportExcel}>Download as Excel</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
