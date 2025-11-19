"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { onIdTokenChanged, signOut, User } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signOutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  signOutUser: async () => {},
});

const syncSessionCookie = async (token: string | null) => {
  try {
    if (!token) {
      await fetch("/api/auth/session", {
        method: "DELETE",
        credentials: "include",
      });
      return;
    }
    await fetch("/api/auth/session", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: token }),
    });
  } catch (error) {
    console.error("Failed to sync auth session:", error);
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const lastToken = useRef<string | null>(null);

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        await syncSessionCookie(null);
        lastToken.current = null;
        setLoading(false);
        return;
      }
      setUser(firebaseUser);
      const token = await firebaseUser.getIdToken();
      if (lastToken.current !== token) {
        lastToken.current = token;
        await syncSessionCookie(token);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signOutUser = useCallback(async () => {
    await signOut(auth);
    lastToken.current = null;
    await syncSessionCookie(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signOutUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
