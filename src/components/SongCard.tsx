// src/components/SongCard.tsx (EN)
"use client";
import React, { useState } from "react";
import { Song } from "@/types/song";
import LyricsModal from "./LyricsModal";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { deleteDoc, doc } from "firebase/firestore";
import clsx from "clsx";

const IS_ADMIN_MODE = true;

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
  const bgColor = clsx({
    "bg-gray-800 border-gray-700": type === "confirm",
    "bg-green-600": type === "success",
    "bg-red-700": type === "error",
  });

  return (
    <div className="fixed inset-0 z-50 bg-gray-900/80 flex items-center justify-center p-4">
      <div className={`p-6 rounded-xl shadow-2xl ${bgColor} text-white max-w-sm w-full text-center border border-gray-700`}>
        <p className="text-lg font-semibold mb-4">{message}</p>
        {type === "confirm" && (
          <div className="flex gap-4 mt-4">
            <button onClick={onConfirm} className="flex-1 py-2 rounded-lg bg-red-800 hover:bg-red-700 font-medium transition">
              Yes, delete
            </button>
            <button onClick={onCancel} className="flex-1 py-2 rounded-lg bg-gray-600 hover:bg-gray-500 font-medium transition">
              Cancel
            </button>
          </div>
        )}
        {type !== "confirm" && (
          <button onClick={onConfirm} className="py-2 rounded-lg bg-white/20 hover:bg-white/30 font-medium transition mt-4 w-full">
            Close
          </button>
        )}
      </div>
    </div>
  );
};

interface SongCardProps {
  song: Song;
  onDeleteSuccess: (deletedSongId: string) => void;
}

export default function SongCard({ song, onDeleteSuccess }: SongCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    msg: string;
    type: "success" | "error" | "confirm";
  } | null>(null);

  const router = useRouter();

  const handleDeletionProcess = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowConfirm(true);
    setStatusMessage({
      msg: `Are you sure you want to delete: ${song.title}?`,
      type: "confirm",
    });
  };

  const executeDelete = async () => {
    setShowConfirm(false);
    try {
      await deleteDoc(doc(db, "songs", song.id));
      setStatusMessage({ msg: `Song '${song.title}' deleted successfully!`, type: "success" });
      setTimeout(() => {
        if (typeof onDeleteSuccess === "function") onDeleteSuccess(song.id);
      }, 1200);
    } catch (err) {
      console.error("Error deleting song:", err);
      setStatusMessage({ msg: "Failed to delete the song.", type: "error" });
      setTimeout(() => setStatusMessage(null), 2500);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/admin?editId=${song.id}`);
  };

  return (
    <>
      <div className="card p-4 flex flex-col gap-2 hover:bg-gray-700 transition cursor-pointer" onClick={() => setIsModalOpen(true)}>
        <div className="flex items-start justify-between">
          {/* Left: Key + Beat as subtle pills */}
          <div className="flex flex-col items-start gap-1">
            {song.Key ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-gray-700/70 border border-gray-600 text-gray-200 px-2.5 py-0.5 text-xs">
                <span className="font-medium">Key</span>
                <span className="opacity-90">·</span>
                <span className="font-semibold text-teal-300">{song.Key}</span>
              </span>
            ) : null}
            {song.Beat ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-gray-700/70 border border-gray-600 text-gray-200 px-2.5 py-0.5 text-xs">
                <span className="font-medium">Beat</span>
                <span className="opacity-90">·</span>
                <span className="font-semibold text-teal-300">{song.Beat}</span>
              </span>
            ) : null}
          </div>
          {/* Right: Title (RTL) + Singer under */}
          <div className="text-right">
            <div className="font-semibold text-lg text-gray-50" dir="rtl">{song.title}</div>
            {song.Singer ? (
              <div className="text-sm text-gray-300 font-medium" dir="rtl">{song.Singer}</div>
            ) : null}
          </div>
        </div>

        {IS_ADMIN_MODE && (
          <div className="flex gap-2 mt-2 pt-2 border-t border-gray-700">
            <button onClick={handleEdit} className="flex-1 text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded-lg transition">
              Edit
            </button>
            <button onClick={handleDeletionProcess} className="flex-1 text-xs bg-red-700 hover:bg-red-600 text-white px-3 py-1 rounded-lg transition">
              Delete
            </button>
          </div>
        )}
      </div>

      <LyricsModal song={song} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      {showConfirm && (
        <StatusPopup
          message={`Are you sure you want to delete: ${song.title}?`}
          type="confirm"
          onConfirm={executeDelete}
          onCancel={() => setShowConfirm(false)}
        />
      )}

      {statusMessage && statusMessage.type !== "confirm" && (
        <StatusPopup message={statusMessage.msg} type={statusMessage.type} onConfirm={() => setStatusMessage(null)} />
      )}
    </>
  );
}
