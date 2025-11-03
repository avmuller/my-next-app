// src/components/SongCard.tsx
"use client";
import React, { useState } from "react";
import { Song } from "@/types/song";
import LyricsModal from "./LyricsModal";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { deleteDoc, doc } from "firebase/firestore";
import clsx from "clsx";

// **משתנה גלובלי זמני:** כדי לדמות מצב "אדמין"
const IS_ADMIN_MODE = true;

// ---------------------- קומפוננטת סטטוס קופץ (אישור/הודעה) ----------------------
const StatusPopup = ({
  message,
  type,
  onConfirm,
  onCancel,
}: {
  message: string;
  type: "confirm" | "success" | "error";
  onConfirm?: () => void;
  onCancel?: () => void;
}) => {
  // הגדרת צבע רקע דינמי
  const bgColor = clsx({
    "bg-gray-800 border-gray-700": type === "confirm", // אפור כהה לאישור
    "bg-green-600": type === "success", // ירוק להצלחה
    "bg-red-700": type === "error", // אדום עמוק לשגיאה
  });

  return (
    <div className="fixed inset-0 z-50 bg-gray-900/80 flex items-center justify-center p-4">
      <div
        className={`p-6 rounded-xl shadow-2xl ${bgColor} text-white max-w-sm w-full text-center border border-gray-700`}
      >
        <p className="text-lg font-semibold mb-4">
          {type === "confirm" ? `❓ ${message}` : message}
        </p>
        {type === "confirm" && (
          <div className="flex gap-4 mt-4">
            <button
              onClick={onConfirm}
              className="flex-1 py-2 rounded-lg bg-red-800 hover:bg-red-700 font-medium transition"
            >
              🗑️ אשר מחיקה
            </button>
            <button
              onClick={onCancel}
              className="flex-1 py-2 rounded-lg bg-gray-600 hover:bg-gray-500 font-medium transition"
            >
              ביטול
            </button>
          </div>
        )}
        {/* כפתור סגירה להודעות הצלחה/שגיאה */}
        {type !== "confirm" && (
          <button
            onClick={onConfirm}
            className="py-2 rounded-lg bg-white/20 hover:bg-white/30 font-medium transition mt-4 w-full"
          >
            סגור
          </button>
        )}
      </div>
    </div>
  );
};
// ----------------------------------------------------------------

// **שינוי 1: הגדרת Props עם פונקציית Callback**
interface SongCardProps {
  song: Song;
  onDeleteSuccess: (deletedSongId: string) => void;
}

export default function SongCard({ song, onDeleteSuccess }: SongCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false); // מצב לאישור מחיקה
  const [statusMessage, setStatusMessage] = useState<{
    msg: string;
    type: "success" | "error" | "confirm";
  } | null>(null); // מצב לסטטוס הצלחה/כישלון

  const router = useRouter();

  // פונקציה להפעלת תהליך המחיקה
  const handleDeletionProcess = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowConfirm(true); // פתיחת חלון האישור
  };

  // פונקציה לביצוע המחיקה בפועל
  const executeDelete = async () => {
    setShowConfirm(false); // סגירת חלון האישור

    try {
      await deleteDoc(doc(db, "songs", song.id));

      // **תיקון קריטי:** הצגת הודעת הצלחה
      setStatusMessage({
        msg: `השיר '${song.title}' נמחק בהצלחה!`,
        type: "success",
      });

      // **פתרון לבעיית ההיעלמות:** השהיית הסרת הרכיב מהמצב של ההורה
      setTimeout(() => {
        if (typeof onDeleteSuccess === "function") {
          onDeleteSuccess(song.id); // הסרת הרכיב מהמסך לאחר שהמשתמש ראה את ההודעה
        }
      }, 1500); // השהייה של 500ms
    } catch (err) {
      console.error("שגיאה במחיקת שיר:", err);
      setStatusMessage({ msg: "אירעה שגיאה במחיקה.", type: "error" });
      setTimeout(() => setStatusMessage(null), 3000); // סגירת הודעת שגיאה
    }
  };

  // פונקציה לעריכה - נווט לדף האדמין עם ID
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/admin?editId=${song.id}`);
  };

  return (
    <>
      {/* 1. כרטיס השיר */}
      <div
        className="card p-4 flex flex-col gap-2 hover:bg-gray-700 transition cursor-pointer"
        onClick={() => setIsModalOpen(true)}
      >
        {/* ... (תוכן כרטיס השיר) ... */}
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold text-gray-50">{song.title}</div>
            {/* <div className="text-sm text-gray-400">{song.Singer}</div> <-- הוסר לפי בקשתך */}
          </div>
          {/* הוספתי font-semibold כאן */}
          <div className="text-sm text-gray-400 font-semibold">
            סולם: {song.Key}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 text-xs text-gray-600">
          {song.Beat && (
            <span
              key="beat"
              // הוספתי font-semibold כאן
              className="badge bg-teal-800 text-teal-400 px-3 py-1 rounded-full font-semibold"
            >
              מקצב: {song.Beat}
            </span>
          )}

          {/* החלקים של Genre ו-Event הוסרו מכאן לפי בקשתך
           */}
        </div>

        {/* **כפתורי ניהול** */}
        {IS_ADMIN_MODE && (
          <div className="flex gap-2 mt-2 pt-2 border-t border-gray-700">
            <button
              onClick={handleEdit}
              className="flex-1 text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded-lg transition"
            >
              ✏️ ערוך
            </button>
            <button
              onClick={handleDeletionProcess}
              className="flex-1 text-xs bg-red-700 hover:bg-red-600 text-white px-3 py-1 rounded-lg transition"
            >
              🗑️ מחק
            </button>
          </div>
        )}
      </div>

      <LyricsModal
        song={song}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {/* 2. מודל אישור מחיקה */}
      {showConfirm && (
        <StatusPopup
          message={`האם ברצונך למחוק את השיר: ${song.title}?`}
          type="confirm"
          onConfirm={executeDelete}
          onCancel={() => setShowConfirm(false)}
        />
      )}

      {/* 3. מודל סטטוס (הודעת הצלחה/שגיאה) */}
      {statusMessage && statusMessage.type !== "confirm" && (
        <StatusPopup
          message={statusMessage.msg}
          type={statusMessage.type}
          onConfirm={() => setStatusMessage(null)} // סוגר את הפופאפ
        />
      )}
    </>
  );
}
