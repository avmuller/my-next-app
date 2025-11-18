// src/components/Admin/ExcelImport.tsx
"use client";
import React, { useState } from "react";
import * as XLSX from "xlsx";
import { importExcelAction } from "@/app/admin/actions";
import { ToastType } from "./AdminToast";

interface ExcelImportProps {
  showToast: (msg: string, type: ToastType) => void;
  onSuccess: () => void;
}

type ExcelJsonRow = Record<string, unknown>;

export default function ExcelImport({
  showToast,
  onSuccess,
}: ExcelImportProps) {
  const [excelData, setExcelData] = useState<ExcelJsonRow[]>([]);

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
        const json = XLSX.utils.sheet_to_json<ExcelJsonRow>(worksheet);
        setExcelData(json);
        showToast(`קובץ נטען בהצלחה (${json.length} שורות).`, "info");
      } catch (error) {
        showToast("שגיאה בקריאת הקובץ.", "error");
        console.error("Excel Read Error:", error);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleImportClick = async () => {
    if (excelData.length === 0) {
      showToast("אין נתונים לייבוא.", "info");
      return;
    }

    try {
      const result = await importExcelAction(excelData);
      showToast(result.message, "success");
      setExcelData([]);
      onSuccess();
    } catch (error) {
      showToast("אירעה שגיאה בזמן הייבוא.", "error");
      console.error("Import Action Error:", error);
    }
  };

  return (
    <section className="mb-8 p-6 rounded-lg shadow-md bg-gray-900">
      <h2 className="text-2xl font-semibold mb-4 text-white">
        יבוא שירים מתוך קובץ Excel
      </h2>
      <div className="flex flex-col gap-4">
        <input
          type="file"
          accept=".xlsx, .xls"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-700 file:text-teal-400 hover:file:bg-gray-600"
        />
        <button
          onClick={handleImportClick}
          disabled={excelData.length === 0}
          className={`py-2 px-4 rounded-md shadow-sm text-sm font-medium text-white ${
            excelData.length > 0
              ? "bg-purple-600 hover:bg-purple-700"
              : "bg-gray-600 cursor-not-allowed"
          }`}
        >
          ייבוא {excelData.length} שירים ל-Firebase
        </button>
      </div>
    </section>
  );
}
