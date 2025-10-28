import Link from "next/link";

const categories = [
  { key: "genres", label: "ז׳אנרים", icon: "🎵" },
  { key: "artists", label: "מלחינים/מבצעים", icon: "🎤" },
  { key: "seasons", label: "עונות/תקופות", icon: "📅" },
  { key: "styles", label: "סגנונות", icon: "🎷" },
  { key: "events", label: "אירועים/סוג שמחה", icon: "🎉" },
  { key: "albums", label: "אלבומים", icon: "💿" },
  { key: "bpms", label: "מקצבים (BPM)/מהירות", icon: "🥁" },
];

export default function CategoryGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6">
      {categories.map((cat) => (
        <Link
          key={cat.key}
          href={`/songs/${cat.key}`}
          className="card p-4 flex items-center justify-between"
        >
          <span className="text-2xl" aria-hidden>
            {cat.icon}
          </span>
          <span className="font-medium">{cat.label}</span>
        </Link>
      ))}
    </div>
  );
}
