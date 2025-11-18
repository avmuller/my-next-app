"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { useAuth } from "@/components/Auth/AuthProvider";

export default function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  const navItems = [
    { href: "/", label: "Home", icon: "🏠" },
    { href: "/playlists", label: "Playlists", icon: "🎵" },
    { href: "/search", label: "Search", icon: "🔍" },
    {
      href: "/login",
      label: user ? "Account" : "Login",
      icon: user ? "👤" : "🔐",
    },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 h-16 z-20 bg-gray-800 shadow-2xl border-t border-gray-700">
      <div className="mx-auto w-full max-w-screen-lg px-4 grid grid-cols-4 h-full text-sm">
        {navItems.map((it) => (
          <Link
            key={it.href}
            href={it.href}
            className={clsx(
              "flex flex-col items-center justify-center pt-1 transition-colors",
              pathname === it.href
                ? "text-teal-400 font-semibold"
                : "text-gray-400 hover:text-teal-300"
            )}
          >
            <span className="text-xl" aria-hidden>
              {it.icon}
            </span>
            <span className="text-xs mt-1">{it.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
