"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import SongCard from "@/components/SongCard";
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
  params: Promise<{ playlistId: string }>;
}) {
  const { playlistId } = use(params);
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
        className="inline-flex w-max items-center gap-2 rounded-full border border-teal-500/40 px-4 py-1.5 text-sm font-medium text-teal-200 hover:text-white hover:border-teal-300 transition"
      >
        <span aria-hidden className="w-4 text-base text-teal-200">
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
            <path
              fillRule="evenodd"
              d="M11.707 4.293a1 1 0 010 1.414L8.414 9H17a1 1 0 110 2H8.414l3.293 3.293a1 1 0 01-1.414 1.414l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </span>
        <span>Back to playlists</span>
      </Link>
      <div className="relative overflow-hidden rounded-2xl border border-teal-500/20 bg-gradient-to-br from-slate-950 via-gray-900 to-slate-950 p-6 shadow-xl shadow-black/40 ring-1 ring-black/30">
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-teal-600/20 via-transparent to-transparent blur-3xl"
        />
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-teal-300/70 mb-2">
              Playlist
            </p>
            <h1 className="text-3xl font-bold text-gray-50">{playlist.name}</h1>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-300">
            <div className="flex items-center gap-2 rounded-full border border-teal-400/30 px-4 py-1.5 text-teal-100 bg-teal-500/10">
              <span aria-hidden>
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                  <path d="M9 4v10.563A3.497 3.497 0 007.5 14a3.5 3.5 0 103.5 3.5V8h6V4H9z" />
                </svg>
              </span>
              <span className="font-semibold">{playlist.songIds.length}</span>
              <span className="text-xs uppercase tracking-wide">Songs</span>
            </div>
            <span className="hidden md:inline text-gray-500">
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-1.5 w-1.5">
                <circle cx="12" cy="12" r="12" />
              </svg>
            </span>
            <p className="text-xs md:text-sm text-gray-400">Curated selection</p>
          </div>
        </div>
      </div>

      {songs.length === 0 ? (
        <p className="text-gray-400">This playlist is empty.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {songs.map((song) => (
            <SongCard key={song.id} song={song} />
          ))}
        </div>
      )}
    </div>
  );
}
