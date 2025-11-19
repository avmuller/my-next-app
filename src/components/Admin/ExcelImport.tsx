"use client";

import React, { useState } from "react";
import * as XLSX from "xlsx";
import { importExcelAction } from "@/app/admin/actions";
import { ToastType } from "./AdminToast";

interface ExcelImportProps {
  showToast: (msg: string, type: ToastType) => void;
  onSuccess: () => void;
}

type ExcelRow = Record<string, string | string[] | undefined>;

export default function ExcelImport({
  showToast,
  onSuccess,
}: ExcelImportProps) {
  const [excelData, setExcelData] = useState<ExcelRow[]>([]);

  const normalizeRow = (row: Record<string, unknown>): ExcelRow => {
    const normalized: ExcelRow = {};
    Object.entries(row).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        normalized[key] = value.map((item) =>
          typeof item === "string" ? item : String(item ?? "")
        );
      } else if (value === null || value === undefined) {
        normalized[key] = undefined;
      } else {
        normalized[key] = typeof value === "string" ? value : String(value);
      }
    });
    return normalized;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = event.target?.result;
      try {
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rawRows =
          XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet);
        const normalizedRows = rawRows.map(normalizeRow);
        setExcelData(normalizedRows);
        showToast(
          `Loaded ${normalizedRows.length} songs from the Excel sheet.`,
          "info"
        );
      } catch (error) {
        showToast("Unable to read Excel file.", "error");
        console.error("Excel Read Error:", error);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleImportClick = async () => {
    if (excelData.length === 0) {
      showToast("Please upload a spreadsheet before importing.", "info");
      return;
    }

    try {
      const result = await importExcelAction(excelData);
      showToast(result.message, "success");
      setExcelData([]);
      onSuccess();
    } catch (error) {
      showToast("Failed to import the spreadsheet.", "error");
      console.error("Import Action Error:", error);
    }
  };

  return (
    <section className="mb-8 rounded-lg bg-gray-900 p-6 shadow-md">
      <h2 className="mb-4 text-2xl font-semibold text-white">
        Import songs from Excel
      </h2>
      <div className="flex flex-col gap-4">
        <input
          type="file"
          accept=".xlsx, .xls"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-400 file:mr-4 file:rounded-full file:border-0 file:bg-gray-700 file:px-4 file:py-2 file:font-semibold file:text-teal-400 hover:file:bg-gray-600"
        />
        <button
          onClick={handleImportClick}
          disabled={excelData.length === 0}
          className={`rounded-md px-4 py-2 text-sm font-medium text-white shadow-sm ${
            excelData.length > 0
              ? "bg-purple-600 hover:bg-purple-700"
              : "cursor-not-allowed bg-gray-600"
          }`}
        >
          Import {excelData.length} rows to Firebase
        </button>
      </div>
    </section>
  );
}
