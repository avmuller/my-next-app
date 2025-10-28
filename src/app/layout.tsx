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
      <body>
        <Header />
        <main className="container-narrow py-4 pb-24">{children}</main>
        <BottomNav />
      </body>
    </html>
  );
}
