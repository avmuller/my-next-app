// src/app/layout.tsx (UPDATED)
// Purpose: Define the root HTML layout shared across all routes.
// Renders the header, a suspense-wrapped main content area,
// and a fixed bottom navigation.
import "./globals.css";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { Suspense } from "react";

export const metadata = {
  // Basic metadata for the app; used by Next.js
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
      {/* Page container with app-wide styling */}
      <body className="mx-auto max-w-screen-sm bg-gray-900">
        <Header />
        {/* Main content area; leaves room for the bottom nav */}
        <main className="pb-24 flex-grow">
          {/* Defer child route rendering until data/components are ready */}
          <Suspense fallback={<div className="text-center text-gray-400 p-8">Loading...</div>}>
            {children}
          </Suspense>
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
