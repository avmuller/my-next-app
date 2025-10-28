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
    <nav className="fixed bottom-0 inset-x-0 z-20 bg-white border-t border-gray-200">
      <div className="mx-auto max-w-screen-sm grid grid-cols-3 text-sm">
        {items.map((it) => (
          <Link
            key={it.href}
            href={it.href}
            className={clsx(
              "flex flex-col items-center py-2",
              pathname === it.href && "text-blue-600 font-semibold"
            )}
          >
            <span className="text-xl" aria-hidden>
              {it.icon}
            </span>
            {it.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
