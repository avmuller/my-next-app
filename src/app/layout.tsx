// src/app/layout.tsx (UPDATED)
import "./globals.css";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";

export const metadata = {
  title: "בחירת שירים לתזמורות",
  description: "אפליקציית ניהול ובחירת רפרטואר מוזיקלי",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl">
      {/* שמירת הגבלת הרוחב לנייד */}
      <body className="mx-auto max-w-screen-sm bg-gray-900">
        <Header />
        {/* הסרת ה-p-4 שהיה קיים קודם כדי למנוע כפילות. נשאיר pb-24 לניווט התחתון. */}
        <main className="pb-24 flex-grow">{children}</main>
        <BottomNav />
      </body>
    </html>
  );
}
