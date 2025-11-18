"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePlaylists } from "@/hooks/usePlaylists";

export default function PlaylistsPage() {
  const { playlists, loading, error, createPlaylist } = usePlaylists();
  const [newName, setNewName] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    await createPlaylist(newName.trim());
    setNewName("");
  };

  return (
    <div className="py-8 text-gray-50 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">My Playlists</h1>
      {error && (
        <div className="mb-4 rounded-lg border border-red-500 bg-red-900/20 px-4 py-2 text-sm text-red-200">
          {error}
        </div>
      )}
      <form
        onSubmit={handleCreate}
        className="flex flex-col sm:flex-row gap-3 mb-6"
      >
        <input
          type="text"
          placeholder="Playlist name..."
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="flex-1 rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-teal-600 px-6 py-2 text-white font-semibold hover:bg-teal-500 disabled:opacity-60"
        >
          Create
        </button>
      </form>

      <div className="space-y-4">
        {loading && (
          <p className="text-sm text-gray-400 text-center">
            Loading your playlists...
          </p>
        )}
        {playlists.length === 0 && !loading ? (
          <p className="text-gray-400 text-center">
            You have not created any playlists yet.
          </p>
        ) : (
          playlists.map((playlist) => (
            <Link
              key={playlist.id}
              href={`/playlists/${playlist.id}`}
              className="block rounded-xl border border-gray-800 bg-gray-900 p-4 shadow-lg hover:border-teal-500 transition"
            >
              <h2 className="text-xl font-semibold">{playlist.name}</h2>
              <p className="text-sm text-gray-400">
                {playlist.songIds.length} songs
              </p>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
