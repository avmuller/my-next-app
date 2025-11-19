// src/components/Playlists/AddToPlaylistMenu.tsx
"use client";

import React, { useMemo, useState } from "react";
import { usePlaylistsContext } from "@/contexts/PlaylistsProvider";

interface AddToPlaylistMenuProps {
  songId: string;
  songTitle: string;
}

/**
 * Small contextual menu that lets the user add the current song to one of the playlists.
 * It fetches playlists via the shared hook and offers inline creation of a new list.
 */
export default function AddToPlaylistMenu({
  songId,
  songTitle,
}: AddToPlaylistMenuProps) {
  const { playlists, loading, error, addSong, createPlaylist } =
    usePlaylistsContext();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [creatingName, setCreatingName] = useState("");
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return playlists.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [playlists, search]);

  const handleAddSong = async (playlistId: string) => {
    try {
      setBusy(true);
      await addSong(playlistId, songId);
      setFeedback(`"${songTitle}" was added successfully.`);
      setOpen(false);
    } catch (err) {
      console.error("Add song failed:", err);
      setFeedback("Unable to add this song right now.");
    } finally {
      setBusy(false);
    }
  };

  const handleCreatePlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!creatingName.trim()) return;
    try {
      setBusy(true);
      await createPlaylist(creatingName.trim());
      setCreatingName("");
      setFeedback("Playlist created. You can add the song now.");
    } catch (err) {
      console.error("Create playlist failed:", err);
      setFeedback("Unable to create playlist.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative">
      <button
        className="rounded-full p-2 text-gray-400 hover:text-teal-300 transition"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((prev) => !prev);
          setFeedback(null);
        }}
        aria-label="Add to playlist menu"
      >
        ⋮
      </button>
      {open && (
        <div
          // ⚠️ FIX: Changed 'right-0' to 'left-0' and added mobile-friendly max-width.
          // max-w-[calc(100vw-32px)] ensures it doesn't overflow the viewport on small screens.
          className="absolute left-0 mt-2 w-64 z-30 max-w-[calc(100vw-32px)] rounded-xl border border-gray-800 bg-gray-950 p-4 shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <p className="text-sm font-semibold text-gray-200 mb-2">
            Add to playlist
          </p>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search playlists..."
            className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <div className="max-h-40 overflow-y-auto mt-3 space-y-2">
            {loading && (
              <p className="text-xs text-gray-500">Loading playlists...</p>
            )}
            {error && <p className="text-xs text-red-400">{error}</p>}
            {!loading && filtered.length === 0 ? (
              <p className="text-xs text-gray-500">
                No playlists match this search.
              </p>
            ) : (
              filtered.map((playlist) => (
                <button
                  key={playlist.id}
                  disabled={busy}
                  onClick={() => handleAddSong(playlist.id)}
                  className="w-full text-right rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-100 hover:bg-gray-800 transition disabled:opacity-50"
                >
                  {playlist.name}
                </button>
              ))
            )}
          </div>
          <form onSubmit={handleCreatePlaylist} className="mt-4 space-y-2">
            <p className="text-xs text-gray-400">Create new playlist</p>
            <input
              type="text"
              value={creatingName}
              onChange={(e) => setCreatingName(e.target.value)}
              placeholder="Playlist name"
              className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-lg bg-teal-600 text-sm font-semibold text-white py-2 hover:bg-teal-500 disabled:opacity-50"
            >
              Create playlist
            </button>
          </form>
          {feedback && <p className="text-xs text-teal-300 mt-2">{feedback}</p>}
        </div>
      )}
    </div>
  );
}
