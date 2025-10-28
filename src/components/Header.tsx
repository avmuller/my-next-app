"use client";
import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b border-gray-200">
      <div className="container-narrow flex items-center justify-between py-3">
        <Link href="/" className="text-lg font-bold">
          בחירת שירים
        </Link>
        <Link href="/admin" className="btn" aria-label="Admin/Settings">
          ⚙️ אדמין
        </Link>
      </div>
    </header>
  );
}
