"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import type { Song } from "@/types/song";

interface PlaylistDetail {
  id: string;
  name: string;
  songIds: string[];
}

interface PlaylistResponse {
  playlist: PlaylistDetail;
  songs: Song[];
}

export default function PlaylistDetailPage({
  params,
}: {
  params: { playlistId: string };
}) {
  const { playlistId } = params;
  const [playlist, setPlaylist] = useState<PlaylistDetail | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/playlists/${playlistId}`);
        if (!response.ok) {
          throw new Error(await response.text());
        }
        const data: PlaylistResponse = await response.json();
        setPlaylist(data.playlist);
        setSongs(data.songs);
        setError(null);
      } catch (err) {
        console.error("Playlist detail load failed:", err);
        setError("Unable to load playlist.");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [playlistId]);

  if (loading) {
    return (
      <div className="py-8 text-center text-gray-300">Loading playlist...</div>
    );
  }

  if (error || !playlist) {
    return (
      <div className="py-8 text-center text-red-300">
        {error || "Playlist not found."}
      </div>
    );
  }

  return (
    <div className="py-8 text-gray-50 max-w-4xl mx-auto space-y-6">
      <Link
        href="/playlists"
        className="text-sm text-teal-300 hover:text-teal-200"
      >
        ← Back to playlists
      </Link>
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <h1 className="text-3xl font-bold mb-2">{playlist.name}</h1>
        <p className="text-sm text-gray-400">{playlist.songIds.length} songs</p>
      </div>

      <div className="space-y-3">
        {songs.length === 0 ? (
          <p className="text-gray-400">This playlist is empty.</p>
        ) : (
          songs.map((song) => (
            <div
              key={song.id}
              className="rounded-xl border border-gray-800 bg-gray-900 p-4"
            >
              <p className="text-lg font-semibold" dir="rtl">
                {song.title}
              </p>
              <p className="text-sm text-gray-400" dir="rtl">
                {song.Singer || "Unknown singer"}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
