import CategoryGrid from "@/components/CategoryGrid";

export default function HomePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">ברוך הבא 🎶</h1>
      <p className="text-gray-600">
        כאן תוכל לבחור שירים לפי קטגוריות, סגנונות, אמנים ועוד.
      </p>
      <CategoryGrid />
    </div>
  );
}
