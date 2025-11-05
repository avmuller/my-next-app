// src/app/layout.tsx (UPDATED)
import "./globals.css";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { Suspense } from "react";

export const metadata = {
  title: "Song Selection",
  description: "A simple app to manage and browse a musical repertoire",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr">
      <body className="mx-auto max-w-screen-sm bg-gray-900">
        <Header />
        <main className="pb-24 flex-grow">
          <Suspense fallback={<div className="text-center text-gray-400 p-8">Loading...</div>}>
            {children}
          </Suspense>
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
