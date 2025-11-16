// src/components/Admin/AdminUIWrapper.tsx
// This component manages the client-side state and interactions (Toast, Reload Key)
// and wraps all the specific admin features.
"use client";

import React from "react";
import SongForm from "@/components/Admin/SongForm";
import ExcelImport from "@/components/Admin/ExcelImport";
import SongManager from "@/components/Admin/SongManager";
import AdminToast, {
  ToastState,
  ToastType,
} from "@/components/Admin/AdminToast";
import type { Song } from "@/types/song";
import type { SongForm as SongFormType } from "@/types/song";

// Interface for server-fetched song data passed to client for editing
interface FormReadySong extends SongFormType {
  id: string;
}

interface AdminUIProps {
  initialAllSongs: Song[];
  uniqueCategories: Record<string, string[]>;
  songToEdit: FormReadySong | null;
}

export default function AdminUIWrapper({
  initialAllSongs,
  uniqueCategories,
  songToEdit,
}: AdminUIProps) {
  // Manages the visible toast message state
  const [toast, setToast] = React.useState<ToastState | null>(null);
  // Key state used to force the parent Server Component to re-render
  const [dataReloadKey, setDataReloadKey] = React.useState(0);

  const showToast = (msg: string, type: ToastType = "info") => {
    setToast({ message: msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // This function is passed down and called after any Server Action (save, delete, import)
  const reloadData = () => {
    // Changing the key forces the parent async component (AdminPage) to re-render,
    // which fetches the new data (songs, categories) from the server.
    setDataReloadKey((prev) => prev + 1);
  };

  return (
    // The key={dataReloadKey} ensures that when we change state (after a save),
    // the whole component remounts, triggering the parent Server Component to re-fetch the new data.
    <main
      dir="rtl"
      className="mx-auto max-w-4xl p-4 text-right"
      key={dataReloadKey}
    >
      {toast && <AdminToast toast={toast} onClose={() => setToast(null)} />}

      <h1 className="text-3xl font-bold mb-6 text-center text-gray-50">
        פנל ניהול שירים 🎵
      </h1>

      <SongForm
        initialSongData={songToEdit}
        uniqueCategories={uniqueCategories}
        showToast={showToast}
        onSuccess={reloadData}
      />

      <div className="h-0.5 w-full bg-teal-500/50 rounded-full mb-8 opacity-80" />

      <ExcelImport showToast={showToast} onSuccess={reloadData} />

      <div className="h-0.5 w-full bg-teal-500/50 rounded-full mb-8 opacity-80" />

      <SongManager
        initialAllSongs={initialAllSongs}
        showToast={showToast}
        onDelete={reloadData}
      />
    </main>
  );
}
