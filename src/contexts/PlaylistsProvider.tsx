"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { PlaylistSummary } from "@/types/playlist";
import { useAuth } from "@/components/Auth/AuthProvider";

//context value type
interface PlaylistsContextValue {
  playlists: PlaylistSummary[];
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  createPlaylist: (name: string) => Promise<void>;
  addSong: (playlistId: string, songId: string) => Promise<void>;
  removeSong: (playlistId: string, songId: string) => Promise<void>;
}

//context creation
const PlaylistsContext = createContext<PlaylistsContextValue | null>(null);

//function to fetch JSON with error handling
const fetchJSON = async <T,>(input: RequestInfo, init?: RequestInit) => {
  const response = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    credentials: "include",
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
  const { user, loading: authLoading } = useAuth();

  const requireAuth = () => {
    if (!user) {
      throw new Error("Please log in to manage playlists.");
    }
  };

  // function to get authorization headers
  const getAuthHeaders = useCallback(async (): Promise<
    HeadersInit | undefined
  > => {
    if (!user) return undefined;
    const token = await user.getIdToken();
    return { Authorization: `Bearer ${token}` };
  }, [user]);

  //function to load playlists
  const load = useCallback(async () => {
    if (!user) {
      setPlaylists([]);
      setError("Please log in to manage playlists.");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const headers = await getAuthHeaders();
      const data = await fetchJSON<{ playlists: PlaylistSummary[] }>(
        "/api/playlists",
        { headers }
      );
      setPlaylists(data.playlists);
    } catch (err) {
      console.error("Failed to load playlists:", err);
      if (err instanceof Error && err.message === "Unauthorized Access") {
        setError("Please log in to manage playlists.");
        setPlaylists([]);
      } else {
        setError("Unable to load playlists.");
      }
    } finally {
      setLoading(false);
    }
  }, [user, getAuthHeaders]);

  useEffect(() => {
    if (authLoading) {
      setLoading(true);
      return;
    }
    void load();
  }, [authLoading, load]);

  const createPlaylist = async (name: string) => {
    requireAuth();
    const headers = await getAuthHeaders();
    await fetchJSON("/api/playlists", {
      method: "POST",
      headers,
      body: JSON.stringify({ name }),
    });
    await load();
  };

  const addSong = async (playlistId: string, songId: string) => {
    requireAuth();
    setPlaylists((prev) =>
      prev.map((playlist) =>
        playlist.id === playlistId && !playlist.songIds.includes(songId)
          ? { ...playlist, songIds: [...playlist.songIds, songId] }
          : playlist
      )
    );
    try {
      const headers = await getAuthHeaders();
      await fetchJSON(`/api/playlists/${playlistId}/songs`, {
        method: "POST",
        headers,
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
    requireAuth();
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
      const headers = await getAuthHeaders();
      await fetchJSON(`/api/playlists/${playlistId}/songs`, {
        method: "DELETE",
        headers,
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
    [playlists, loading, error, load]
  );

  return (
    <PlaylistsContext.Provider value={value}>
      {children}
    </PlaylistsContext.Provider>
  );
}

export const usePlaylistsContext = () => {
  const context = useContext(PlaylistsContext);
  if (!context)
    throw new Error(
      "usePlaylistsContext must be used inside PlaylistsProvider"
    );
  return context;
};
