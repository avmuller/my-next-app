"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePlaylistsContext } from "@/contexts/PlaylistsProvider";
import type { PlaylistSummary } from "@/types/playlist";

export default function PlaylistsPage() {
  const { playlists, loading, error, createPlaylist } = usePlaylistsContext();
  const [newName, setNewName] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    await createPlaylist(newName.trim());
    setNewName("");
  };

  return (
    <div className="py-8 text-gray-50 max-w-5xl mx-auto space-y-6">
      <div className="rounded-2xl border border-teal-500/20 bg-gradient-to-br from-slate-950 via-gray-900 to-slate-950 p-6 shadow-xl shadow-black/40 ring-1 ring-black/30">
        <h1 className="text-3xl font-bold mb-2 text-center text-gray-50">
          My Playlists
        </h1>
        <p className="text-base text-gray-400 text-center mb-4">
          Create personal collections of songs and access them from anywhere.
        </p>
        {error && (
          <div className="mb-4 rounded-lg border border-red-500 bg-red-900/30 px-4 py-2 text-sm text-red-200 text-center">
            {error}
          </div>
        )}
        <form
          onSubmit={handleCreate}
          className="flex flex-col sm:flex-row gap-3"
        >
          <input
            type="text"
            placeholder="Playlist name..."
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="flex-1 rounded-2xl border border-gray-700 bg-gray-900 px-4 py-2 text-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-inner"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-400 px-6 py-2 text-white font-semibold shadow-lg shadow-teal-800/50 hover:scale-[1.01] transition disabled:opacity-60"
          >
            Create playlist
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading && (
          <p className="text-sm text-gray-400 text-center col-span-full">
            Loading your playlists...
          </p>
        )}
        {playlists.length === 0 && !loading ? (
          <p className="text-gray-400 text-center col-span-full">
            You have not created any playlists yet.
          </p>
        ) : (
          playlists.map((playlist) => (
            <PlaylistCard key={playlist.id} playlist={playlist} />
          ))
        )}
      </div>
    </div>
  );
}

const PlaylistCard = ({ playlist }: { playlist: PlaylistSummary }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.preventDefault();
    event.stopPropagation();
    setMenuOpen((prev) => !prev);
  };

  const handleMenuAction = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    action: "rename" | "delete"
  ) => {
    event.preventDefault();
    event.stopPropagation();
    setMenuOpen(false);
    alert(`${action === "rename" ? "Rename" : "Delete"} coming soon`);
  };

  return (
    <div className="relative rounded-2xl border border-teal-500/15 bg-gradient-to-br from-slate-950 via-gray-900 to-slate-950 p-5 shadow-lg shadow-black/30 ring-1 ring-black/20 hover:ring-teal-400 hover:shadow-teal-700/30 transition">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-6 -top-10 h-24 rounded-full bg-teal-500/20 blur-3xl"
      />
      <Link href={`/playlists/${playlist.id}`} className="block pr-10">
        <p className="text-sm text-teal-200 mb-1">
          Playlist - {playlist.songIds.length} songs
        </p>
        <h2 className="text-2xl font-semibold text-gray-50">
          {playlist.name}
        </h2>
        <p className="text-xs text-gray-400 mt-2">Updated recently</p>
      </Link>
      <button
        onClick={toggleMenu}
        className="absolute top-3 right-3 rounded-full p-2 text-gray-300 hover:text-teal-300 transition"
        aria-label="Playlist actions menu"
      >
        ?
      </button>
      {menuOpen && (
        <div className="absolute top-12 right-3 z-20 w-36 rounded-xl border border-gray-800 bg-gray-950 p-2 shadow-xl">
          <button
            onClick={(event) => handleMenuAction(event, "rename")}
            className="w-full rounded-lg px-3 py-2 text-sm text-gray-100 text-right hover:bg-gray-900 transition"
          >
            Rename
          </button>
          <button
            onClick={(event) => handleMenuAction(event, "delete")}
            className="w-full rounded-lg px-3 py-2 text-sm text-rose-300 text-right hover:bg-rose-900/30 transition"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
};
