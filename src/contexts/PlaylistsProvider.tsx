"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { PlaylistSummary } from "@/types/playlist";

interface PlaylistsContextValue {
  playlists: PlaylistSummary[];
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  createPlaylist: (name: string) => Promise<void>;
  addSong: (playlistId: string, songId: string) => Promise<void>;
  removeSong: (playlistId: string, songId: string) => Promise<void>;
}

const PlaylistsContext = createContext<PlaylistsContextValue | null>(null);

const fetchJSON = async <T,>(input: RequestInfo, init?: RequestInit) => {
  const response = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });
  if (!response.ok) {
    const message = await response.text();
    if (response.status === 401 || response.status === 403) {
      throw new Error("Unauthorized Access", { cause: response.status });
    }
    throw new Error(message || "Request failed");
  }
  return (await response.json()) as T;
};

export function PlaylistsProvider({ children }: { children: React.ReactNode }) {
  const [playlists, setPlaylists] = useState<PlaylistSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      const data = await fetchJSON<{ playlists: PlaylistSummary[] }>(
        "/api/playlists"
      );
      setPlaylists(data.playlists);
      setError(null);
    } catch (err) {
      console.error("Failed to load playlists:", err);
      if (err instanceof Error && err.message === "Unauthorized Access") {
        setError("Please log in to manage playlists.");
      } else {
        setError("Unable to load playlists.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const createPlaylist = async (name: string) => {
    await fetchJSON("/api/playlists", {
      method: "POST",
      body: JSON.stringify({ name }),
    });
    await load();
  };

  const addSong = async (playlistId: string, songId: string) => {
    setPlaylists((prev) =>
      prev.map((playlist) =>
        playlist.id === playlistId &&
        !playlist.songIds.includes(songId)
          ? { ...playlist, songIds: [...playlist.songIds, songId] }
          : playlist
      )
    );
    try {
      await fetchJSON(`/api/playlists/${playlistId}/songs`, {
        method: "POST",
        body: JSON.stringify({ songId }),
      });
    } catch (err) {
      setPlaylists((prev) =>
        prev.map((playlist) =>
          playlist.id === playlistId
            ? {
                ...playlist,
                songIds: playlist.songIds.filter((id) => id !== songId),
              }
            : playlist
        )
      );
      throw err;
    }
  };

  const removeSong = async (playlistId: string, songId: string) => {
    setPlaylists((prev) =>
      prev.map((playlist) =>
        playlist.id === playlistId
          ? {
              ...playlist,
              songIds: playlist.songIds.filter((id) => id !== songId),
            }
          : playlist
      )
    );
    try {
      await fetchJSON(`/api/playlists/${playlistId}/songs`, {
        method: "DELETE",
        body: JSON.stringify({ songId }),
      });
    } catch (err) {
      setPlaylists((prev) =>
        prev.map((playlist) =>
          playlist.id === playlistId
            ? { ...playlist, songIds: [...playlist.songIds, songId] }
            : playlist
        )
      );
      throw err;
    }
  };

  const value = useMemo(
    () => ({
      playlists,
      loading,
      error,
      reload: load,
      createPlaylist,
      addSong,
      removeSong,
    }),
    [playlists, loading, error]
  );

  return (
    <PlaylistsContext.Provider value={value}>
      {children}
    </PlaylistsContext.Provider>
  );
}

export const usePlaylistsContext = () => {
  const context = useContext(PlaylistsContext);
  if (!context) throw new Error("usePlaylistsContext must be used inside PlaylistsProvider");
  return context;
};
