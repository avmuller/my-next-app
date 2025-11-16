// src/components/Admin/AdminToast.tsx
"use client";
import React from "react";

export type ToastType = "success" | "error" | "info";
export interface ToastState {
  message: string;
  type: ToastType;
}

const getBgColor = (type: ToastType) => {
  if (type === "success") return "bg-green-600";
  if (type === "error") return "bg-red-600";
  return "bg-blue-600";
};

export default function AdminToast({
  toast,
  onClose,
}: {
  toast: ToastState | null;
  onClose: () => void;
}) {
  if (!toast) return null;

  const bgColor = getBgColor(toast.type);
  const textColor = "text-white";

  return (
    <div
      dir="rtl"
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 p-4 rounded-xl shadow-2xl ${bgColor} ${textColor} transition-all duration-300`}
      style={{ minWidth: "250px" }}
    >
      <div className="flex justify-between items-center">
        <p className="font-semibold">{toast.message}</p>
        <button onClick={onClose} className={`text-xl ${textColor} ml-4`}>
          &times;
        </button>
      </div>
    </div>
  );
}
