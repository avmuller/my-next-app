"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";
import { useAuth } from "@/components/Auth/AuthProvider";

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

const baseNavItems: NavItem[] = [
  { href: "/", label: "Home", icon: "\u2302" },
  { href: "/playlists", label: "Playlists", icon: "\u266B" },
  { href: "/search", label: "Search", icon: "\u2315" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, signOutUser } = useAuth();
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement | null>(null);
  const [loginPromptVisible, setLoginPromptVisible] = useState(false);
  const loginPromptTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!accountMenuOpen) return;
    const handleClick = (event: MouseEvent) => {
      if (
        accountRef.current &&
        !accountRef.current.contains(event.target as Node)
      ) {
        setAccountMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [accountMenuOpen]);

  useEffect(() => {
    setAccountMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    return () => {
      if (loginPromptTimer.current) {
        clearTimeout(loginPromptTimer.current);
      }
    };
  }, []);

  const accountLabel = user ? "Account" : "Login";
  const accountIcon = user ? "\u{1F464}" : "\u{1F511}";
  const isAccountActive =
    pathname === "/login" || pathname === "/account" || accountMenuOpen;

  const showLoginPrompt = () => {
    setLoginPromptVisible(true);
    if (loginPromptTimer.current) {
      clearTimeout(loginPromptTimer.current);
    }
    loginPromptTimer.current = setTimeout(() => {
      setLoginPromptVisible(false);
    }, 3000);
  };

  const handleLogout = async () => {
    if (!user) return;
    await signOutUser();
    setAccountMenuOpen(false);
    router.push("/");
    router.refresh();
  };

  const handleLogin = () => {
    setAccountMenuOpen(false);
    router.push("/login");
  };

  const handlePlaylistClick = (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) => {
    if (!user) {
      event.preventDefault();
      showLoginPrompt();
    }
  };

  return (
    <nav className="fixed bottom-0 inset-x-0 h-16 z-20 bg-gray-800 shadow-2xl border-t border-gray-700">
      <div className="mx-auto w-full max-w-screen-lg px-4 grid grid-cols-4 h-full text-sm">
        {baseNavItems.map((item) => {
          const isPlaylist = item.href === "/playlists";
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={isPlaylist ? handlePlaylistClick : undefined}
              className={clsx(
                "flex flex-col items-center justify-center pt-1 transition-colors",
                pathname === item.href
                  ? "text-teal-400 font-semibold"
                  : "text-gray-400 hover:text-teal-300"
              )}
            >
              <span className="text-xl" aria-hidden>
                {item.icon}
              </span>
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          );
        })}
        <div
          ref={accountRef}
          className="relative flex flex-col items-center justify-center"
        >
          <button
            type="button"
            aria-haspopup="menu"
            aria-expanded={accountMenuOpen}
            onClick={() => setAccountMenuOpen((prev) => !prev)}
            className={clsx(
              "flex flex-col items-center justify-center pt-1 transition-colors w-full focus:outline-none",
              isAccountActive
                ? "text-teal-400 font-semibold"
                : "text-gray-400 hover:text-teal-300"
            )}
          >
            <span className="text-xl" aria-hidden>
              {accountIcon}
            </span>
            <span className="text-xs mt-1">{accountLabel}</span>
          </button>
          {accountMenuOpen && (
            <div className="absolute bottom-16 right-0 w-48 rounded-2xl border border-gray-700 bg-gray-900/95 p-3 text-right shadow-2xl">
              {loading ? (
                <p className="text-xs text-gray-400">Checking session...</p>
              ) : user ? (
                <>
                  <p className="text-xs text-gray-400 mb-2">
                    Signed in as
                    <br />
                    <span className="text-sm font-semibold text-gray-50">
                      {user.displayName || user.email || "User"}
                    </span>
                  </p>
                  <button
                    onClick={handleLogout}
                    className="w-full rounded-xl border border-teal-500/40 px-3 py-2 text-sm font-semibold text-teal-200 hover:text-white hover:bg-teal-500/10 transition"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <button
                  onClick={handleLogin}
                  className="w-full rounded-xl border border-teal-500/40 px-3 py-2 text-sm font-semibold text-teal-200 hover:text-white hover:bg-teal-500/10 transition"
                >
                  Login
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      {loginPromptVisible && !user && (
        <div className="absolute left-1/2 bottom-20 w-[calc(100%-3rem)] max-w-sm -translate-x-1/2 rounded-2xl border border-rose-500/40 bg-rose-900/90 px-4 py-3 text-center shadow-2xl">
          <p className="text-sm font-semibold text-rose-100">
            Please log in to access playlists.
          </p>
          <button
            onClick={handleLogin}
            className="mt-2 w-full rounded-xl border border-rose-200/40 px-3 py-2 text-xs font-semibold text-white hover:bg-rose-500/20 transition"
          >
            Go to Login
          </button>
        </div>
      )}
    </nav>
  );
}
