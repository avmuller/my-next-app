import Link from "next/link";
import { demoSongs } from "@/data/demoSongs";

export default async function SubCategoriesPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;

  // מיפוי שם קריא
  const labelMap: Record<string, string> = {
    genres: "ז׳אנרים",
    artists: "מלחינים/מבצעים",
    seasons: "עונות/תקופות",
    styles: "סגנונות",
    events: "אירועים/סוג שמחה",
    albums: "אלבומים",
    bpms: "מקצבים (BPM)/מהירות",
  };

  let subCategories: string[] = [];

  if (category === "artists") {
    subCategories = Array.from(new Set(demoSongs.map((s) => s.artist)));
  } else if (category === "genres") {
    subCategories = Array.from(new Set(demoSongs.flatMap((s) => s.genres)));
  } else if (category === "styles") {
    subCategories = Array.from(new Set(demoSongs.flatMap((s) => s.styles)));
  } else if (category === "events") {
    subCategories = Array.from(new Set(demoSongs.flatMap((s) => s.events)));
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">
        {labelMap[category] || "תתי קטגוריות"}
      </h1>

      {subCategories.length === 0 && (
        <p className="text-gray-500">לא נמצאו תתי־קטגוריות עבור קטגוריה זו</p>
      )}

      <div className="grid gap-3">
        {subCategories.map((sub) => (
          <Link
            key={sub}
            href={`/songs/${category}/${encodeURIComponent(sub)}`}
            className="card p-4 flex justify-between items-center"
          >
            <span>{sub}</span>
            <span className="text-gray-500">➡️</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
