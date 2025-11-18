// src/components/Header.tsx (EN)
"use client";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/Auth/AuthProvider";

interface HeaderProps {
  title?: string;
}

export default function Header({ title }: HeaderProps) {
  const router = useRouter();
  const { user, loading, signOutUser } = useAuth();
  const handleSignOut = async () => {
    await signOutUser();
    router.push("/");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-20 h-24 flex-shrink-0 bg-gray-900/90 backdrop-blur border-b border-gray-800">
      <div className="flex items-center h-full px-4 gap-4">
        <Link
          href="/"
          className="flex items-center gap-4 text-2xl font-bold text-gray-50 min-w-0"
        >
          <Image
            src="/logo.png"
            alt="App logo"
            width={80}
            height={80}
            priority
          />
          <span className="truncate">{title || "Song Selection"}</span>
        </Link>
        <div className="ml-auto flex items-center gap-3" />
      </div>
    </header>
  );
}
