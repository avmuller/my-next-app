"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebaseClient";

interface LoginFormProps {
  redirectTo?: string;
}

export default function LoginForm({ redirectTo = "/" }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const finalizeLogin = async () => {
    const user = auth.currentUser;
    if (!user) throw new Error("User session not found.");
    const idToken = await user.getIdToken();
    await fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });
    router.push(redirectTo || "/");
    router.refresh();
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (isRegisterMode) {
        if (password !== confirmPassword) {
          setError("הסיסמאות אינן תואמות.");
          setLoading(false);
          return;
        }
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      await finalizeLogin();
    } catch (err) {
      console.error("Email auth failed:", err);
      setError(
        isRegisterMode
          ? "לא הצלחנו ליצור משתמש. נסה שוב או בדוק אם האימייל תפוס."
          : "ההתחברות נכשלה. בדוק את הפרטים ונסה שוב."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      await finalizeLogin();
    } catch (err) {
      console.error("Google login failed:", err);
      setError("לא ניתן להתחבר עם Google כעת.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-md mx-auto mt-10 rounded-2xl bg-gray-900 border border-gray-800 p-6 shadow-xl">
      <h1 className="text-3xl font-semibold text-center text-gray-50 mb-6">
        {isRegisterMode ? "יצירת חשבון חדש" : "התחברות לחשבון"}
      </h1>
      <form onSubmit={handleEmailSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-300 mb-1" htmlFor="email">
            אימייל
          </label>
          <input
            id="email"
            type="email"
            dir="ltr"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
            required
          />
        </div>
        <div>
          <label
            className="block text-sm text-gray-300 mb-1"
            htmlFor="password"
          >
            סיסמה
          </label>
          <input
            id="password"
            type="password"
            dir="ltr"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
            required
          />
        </div>
        {isRegisterMode && (
          <div>
            <label
              className="block text-sm text-gray-300 mb-1"
              htmlFor="confirmPassword"
            >
              אימות סיסמה
            </label>
            <input
              id="confirmPassword"
              type="password"
              dir="ltr"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>
        )}
        {error && (
          <p className="text-sm text-red-400 bg-red-950/30 border border-red-800 rounded-lg px-3 py-2">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-semibold py-2 transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading
            ? isRegisterMode
              ? "יוצר חשבון..."
              : "מתחבר..."
            : isRegisterMode
            ? "יצירת חשבון"
            : "התחברות"}
        </button>
      </form>
      <div className="mt-6 space-y-3">
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full rounded-lg border border-gray-600 text-gray-100 font-medium py-2 hover:bg-gray-800 transition disabled:opacity-60"
        >
          התחברות עם Google
        </button>
        <button
          onClick={() => router.push("/")}
          className="w-full rounded-lg bg-gray-700 text-gray-100 font-medium py-2 hover:bg-gray-600 transition"
        >
          המשך כאורח
        </button>
        <button
          onClick={() => {
            setIsRegisterMode((prev) => !prev);
            setError(null);
          }}
          className="w-full rounded-lg border border-transparent text-sm text-teal-300 hover:text-teal-200"
        >
          {isRegisterMode
            ? "יש לך חשבון? התחבר"
            : "עדיין אין חשבון? הירשם כאן"}
        </button>
      </div>
    </section>
  );
}
