"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const items = [
  { href: "/", label: "ראשי", icon: "🏠" },
  { href: "/playlists", label: "הרשימות שלי", icon: "📚" },
  { href: "/search", label: "חיפוש", icon: "🔎" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    // **שינוי:** רקע כהה, גבול כהה, צל כהה
    <nav className="fixed bottom-0 inset-x-0 h-16 z-20 bg-gray-800 shadow-2xl border-t border-gray-700">
      <div className="mx-auto max-w-screen-sm grid grid-cols-3 h-full text-sm">
        {items.map((it) => (
          <Link
            key={it.href}
            href={it.href}
            className={clsx(
              "flex flex-col items-center justify-center pt-1 transition-colors",
              pathname === it.href
                ? "text-teal-400 font-semibold" // **שינוי:** צבע ראשי (Accent)
                : "text-gray-400 hover:text-teal-300" // **שינוי:** טקסט אפור בהיר לא פעיל
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
