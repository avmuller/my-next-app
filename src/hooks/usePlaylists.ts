"use client";

import { useCallback, useEffect, useState } from "react";
import type { PlaylistSummary } from "@/types/playlist";

// Reusable helper to parse JSON responses and throw meaningful errors on failures.
const fetchJSON = async <T>(
  input: RequestInfo,
  init?: RequestInit
): Promise<T> => {
  const response = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Request failed");
  }
  return response.json() as Promise<T>;
};

/**
 * Shared hook that keeps the user's playlists in sync with the API.
 * Supports listing, creating, and editing playlists while exposing loading/error state.
 */
export const usePlaylists = () => {
  const [playlists, setPlaylists] = useState<PlaylistSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchJSON<{ playlists: PlaylistSummary[] }>(
        "/api/playlists",
        { method: "GET" }
      );
      setPlaylists(data.playlists);
      setError(null);
    } catch (err) {
      console.error("Failed to load playlists:", err);
      setError("Unable to load playlists.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const createPlaylist = useCallback(
    async (name: string) => {
      await fetchJSON("/api/playlists", {
        method: "POST",
        body: JSON.stringify({ name }),
      });
      await load();
    },
    [load]
  );

  const addSong = useCallback(
    async (playlistId: string, songId: string) => {
      await fetchJSON(`/api/playlists/${playlistId}/songs`, {
        method: "POST",
        body: JSON.stringify({ songId }),
      });
      await load();
    },
    [load]
  );

  const removeSong = useCallback(
    async (playlistId: string, songId: string) => {
      await fetchJSON(`/api/playlists/${playlistId}/songs`, {
        method: "DELETE",
        body: JSON.stringify({ songId }),
      });
      await load();
    },
    [load]
  );

  return {
    playlists,
    loading,
    error,
    reload: load,
    createPlaylist,
    addSong,
    removeSong,
  };
};
