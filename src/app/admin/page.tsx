// src/app/admin/page.tsx
// Purpose: Admin interface to add, edit, import (Excel), and manage songs.
// Includes form handling, Firestore CRUD operations, and simple toasts.
"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  getDoc,
  getDocs, // נשאר עבור Autocomplete
} from "firebase/firestore";
import * as XLSX from "xlsx";
import { Song, SongForm } from "@/types/song";
import { useSearchParams, useRouter } from "next/navigation";

// **1. הגדרת קבוצות שדות ברורות**
// Fields that map to a single string value; used to build autocomplete lists
const SINGLE_VALUE_FIELDS_FOR_AUTOCOMPLETE: (keyof Song)[] = [
  "Singer",
  "Composer",
  "Key",
  "Beat", // Beat נשאר כאן עבור ה-datalist
  "Theme",
  "hasidut",
];

// שדות מרובי ערכים (אלו שמושבתת בהם ההשלמה)
// Fields that are arrays on the Song object
const MULTI_VALUE_FIELDS: (keyof Song)[] = ["Genre", "Event", "Season"];

// שדות שאנו מביאים מ-DB לצורך השלמה אוטומטית (איחוד של שתי הרשימות)
// Combined list of fields we query across to collect unique values
const FIELDS_FOR_UNIQUE_FETCH = [
  ...SINGLE_VALUE_FIELDS_FOR_AUTOCOMPLETE,
  ...MULTI_VALUE_FIELDS,
];

// מצב ראשוני לטופס
// Initial state for the admin form
const initialSongState: SongForm = {
  title: "",
  Beat: "",
  Key: "",
  Genre: [],
  Event: [],
  Theme: "",
  Composer: "",
  Singer: "",
  Season: [],
  hasidut: "",
  Lyrics: "",
};

// פונקציית עזר לניקוי ופיצול מחרוזת למערך
// Utility: split a comma-separated string into a clean string array
const splitAndClean: (value: string | string[]) => string[] = (value) => {
  if (Array.isArray(value)) return value.filter((v) => v && v.trim() !== "");
  if (typeof value !== "string") return [];

  return value
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
};

// ---------------------- קומפוננטת TOAST ----------------------
const Toast = ({
  message,
  type,
  onClose,
}: {
  message: string;
  type: "success" | "error" | "info";
  onClose: () => void;
}) => {
  if (!message) return null;

  const bgColor =
    type === "success"
      ? "bg-green-600"
      : type === "error"
      ? "bg-red-600"
      : "bg-blue-600";
  const textColor = "text-white";

  return (
    <div
      dir="rtl"
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 p-4 rounded-xl shadow-2xl ${bgColor} ${textColor} transition-all duration-300`}
      style={{ minWidth: "250px" }}
    >
      <div className="flex justify-between items-center">
        <p className="font-semibold">{message}</p>
        <button onClick={onClose} className={`text-xl ${textColor} ml-4`}>
          &times;
        </button>
      </div>
    </div>
  );
};
// ----------------------------------------------------------------

export default function AdminPage() {
  const [song, setSong] = useState<SongForm>(initialSongState);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);
  const [excelData, setExcelData] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [uniqueCategories, setUniqueCategories] = useState<
    Record<string, string[]>
  >({});
  // Autocomplete state for custom suggestion list
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [queries, setQueries] = useState<Record<string, string>>({});

  const router = useRouter();
  const searchParams = useSearchParams();
  const editIdFromURL = searchParams.get("editId");

  const showToast = (
    msg: string,
    type: "success" | "error" | "info" = "info"
  ) => {
    setToast({ message: msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // ---------------------- לוגיקת השלמה אוטומטית (נשמרה) ----------------------
  useEffect(() => {
    fetchUniqueCategories();
  }, []);

  useEffect(() => {
    if (editIdFromURL) {
      fetchSongForEdit(editIdFromURL);
    } else {
      setIsEditing(null);
      setSong(initialSongState);
    }
  }, [editIdFromURL]);

  const fetchUniqueCategories = async () => {
    try {
      const songSnapshot = await getDocs(collection(db, "songs"));
      const allData: Song[] = songSnapshot.docs.map(
        (doc) => doc.data() as Song
      );

      const uniqueData: Record<
        string,
        Set<string>
      > = FIELDS_FOR_UNIQUE_FETCH.reduce((acc, field) => {
        acc[field as string] = new Set();
        return acc;
      }, {} as Record<string, Set<string>>);

      allData.forEach((song) => {
        FIELDS_FOR_UNIQUE_FETCH.forEach((field) => {
          const value = (song as any)[field];

          if (Array.isArray(value)) {
            value.forEach(
              (item) => item && uniqueData[field as string].add(item)
            );
          } else if (value) {
            uniqueData[field as string].add(String(value));
          }
        });
      });

      const result: Record<string, string[]> = {};
      Object.keys(uniqueData).forEach((key) => {
        result[key] = Array.from(uniqueData[key]).sort((a, b) =>
          a.localeCompare(b, "en")
        );
      });

      setUniqueCategories(result);
    } catch (error) {
      console.error("Error fetching unique categories:", error);
    }
  };
  // ----------------------------------------------------------------

  // ---------------------- לוגיקת CRUD (נשמרה) ----------------------
  const fetchSongForEdit = async (id: string) => {
    try {
      const docRef = doc(db, "songs", id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setIsEditing(id);

        setSong({
          title: data.title,
          Beat: data.Beat,
          Key: data.Key,
          Theme: data.Theme,
          Composer: data.Composer,
          Singer: data.Singer,
          hasidut: data.hasidut,
          Lyrics: data.Lyrics,
          Season: Array.isArray(data.Season) ? data.Season.join(", ") : "",
          Genre: Array.isArray(data.Genre) ? data.Genre.join(", ") : "",
          Event: Array.isArray(data.Event) ? data.Event.join(", ") : "",
        } as unknown as SongForm);
      } else {
        showToast(`Error: Song with ID ${id} not found.`, "error");
        setIsEditing(null);
        router.replace("/admin");
      }
    } catch (error) {
      showToast("Failed to load song data for editing.", "error");
      setIsEditing(null);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(null);
    setSong(initialSongState);
    showToast("Edit canceled.", "info");
    router.replace("/admin");
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // **הסרת לוגיקת Rhythm Changes מ-Beat**
      let finalBeat = song.Beat.trim();

      // **הסרת לוגיקת Rhythm Changes מ-Key**
      let finalKey = song.Key.trim();

      const processedSongData = {
        title: song.title,
        Beat: finalBeat, // Beat נשמר כפי שהוזן (מחרוזת)
        Key: finalKey, // Key נשמר כפי שהוזן (מחרוזת)
        Theme: song.Theme,
        Composer: song.Composer,
        Singer: song.Singer,
        hasidut: song.hasidut,
        Lyrics: song.Lyrics,
        Season: splitAndClean(song.Season as unknown as string),
        Genre: splitAndClean(song.Genre as unknown as string),
        Event: splitAndClean(song.Event as unknown as string),
        createdAt: new Date(),
      };

      if (isEditing) {
        const songRef = doc(db, "songs", isEditing);
        await updateDoc(songRef, processedSongData);
        showToast("✔️ Song updated successfully!", "success");
        setIsEditing(null);
        router.replace("/admin");
      } else {
        await addDoc(collection(db, "songs"), processedSongData);
        showToast("➕ Song added successfully!", "success");
        fetchUniqueCategories();
      }

      setSong(initialSongState);
    } catch (error) {
      console.error("Error adding/updating document: ", error);
      showToast("❌ Error saving song. Check the console.", "error");
    }
  };

  const handleManualChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setSong((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = event.target?.result;
      const workbook = XLSX.read(data, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(worksheet);
      setExcelData(json);
      showToast(`Excel file loaded. Found ${json.length} rows.`, "info");
    };
    reader.readAsBinaryString(file);
  };

  const handleImportExcel = async () => {
    if (excelData.length === 0) {
      showToast("No data to import.", "info");
      return;
    }

    let successfulImports = 0;
    const songsCollection = collection(db, "songs");

    for (const row of excelData) {
      try {
        // **הסרת לוגיקת Rhythm Changes מ-Beat**
        let excelBeat = row["Beat"] || "";
        // **הסרת לוגיקת Rhythm Changes מ-Key**
        let excelKey = row["Key"] || "";

        const songData: Omit<Song, "id"> = {
          title: row["Song"] || row["title"] || "",
          Beat: excelBeat, // Beat נשמר כפי שהוזן (מחרוזת)
          Key: excelKey, // Key נשמר כפי שהוזן (מחרוזת)
          Theme: row["Theme"] || "",
          Composer: row["Composer"] || "",
          Singer: row["Singer"] || "",
          Season: splitAndClean(row["Season"]),
          hasidut: row["hasidut"] || "",
          Lyrics: row["Lyrics"] || "",
          Genre: splitAndClean(row["Genre"]),
          Event: splitAndClean(row["Event"]),
          createdAt: new Date(),
        };

        await addDoc(songsCollection, songData);
        successfulImports++;
      } catch (e) {
        console.error("Error importing song: ", row, e);
      }
    }

    showToast(`Import complete! ${successfulImports} songs imported successfully.`, "success");
    setExcelData([]);
    fetchUniqueCategories(); // רענון נתוני ההשלמה האוטומטית
  };
  // ----------------------------------------------------------------

  const formFields = Object.keys(initialSongState);

  return (
    <main dir="rtl" className="mx-auto max-w-4xl p-4 text-right">
      {/* **הודעה קופצת (Toast)** */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <h1 className="text-3xl font-bold mb-6 text-center text-gray-50">
        פנל ניהול שירים 🎵
      </h1>

      {/* הטופס */}
      <section className="mb-8 p-6 rounded-lg shadow-2xl bg-gray-900">
        <h2 className="text-2xl font-semibold mb-4 text-white">
          {isEditing ? `עריכת שיר: ${song.title}` : "הוספת שיר יחיד"}
        </h2>

        <form onSubmit={handleManualSubmit} className="grid grid-cols-2 gap-4">
          {formFields.map((key) => {
            const isMultiValue = MULTI_VALUE_FIELDS.includes(key as keyof Song);
            const isAutocomplete =
              SINGLE_VALUE_FIELDS_FOR_AUTOCOMPLETE.includes(key as keyof Song);
            // **שינוי 4: Key הוסר משדות החובה**
            const isRequired = key === "title" || key === "Singer";

            return (
              <div key={key} className="relative">
                <label
                  htmlFor={key}
                  className="block text-sm font-medium text-white"
                >
                  {key === "title"
                    ? "Title (Song)"
                    : key.charAt(0).toUpperCase() + key.slice(1)}
                  {key === "year" && " (שנה)"}
                  {isMultiValue && " (מופרד בפסיקים)"}
                </label>
                <input
                  type={key === "year" ? "number" : "text"}
                  name={key}
                  id={key}
                  value={
                    isMultiValue
                      ? (
                          song[key as keyof SongForm] as string[] | string
                        )?.toString()
                      : (song[key as keyof SongForm] as string) || ""
                  }
                  onFocus={() => isAutocomplete && setOpenKey(key)}
                  onBlur={() =>
                    setTimeout(
                      () => setOpenKey((k) => (k === key ? null : k)),
                      100
                    )
                  }
                  onChange={(e) => {
                    handleManualChange(e);
                    if (isAutocomplete) {
                      const v = e.target.value ?? "";
                      setQueries((prev) => ({ ...prev, [key]: v }));
                      setOpenKey(key);
                    }
                  }}
                  required={isRequired}
                  autoComplete="off"
                  className="mt-1 block w-full border border-gray-700 rounded-md shadow-sm p-2 bg-gray-800 text-gray-50 placeholder-gray-500"
                />

                {/* הגדרת ה-DATALIST (רק לשדות ערך יחיד) */}
                {isAutocomplete && openKey === key && uniqueCategories[key] && (
                  <div className="absolute z-20 mt-1 w-full max-h-48 overflow-auto rounded-md border border-gray-700 bg-gray-800 text-gray-50 shadow-lg">
                    {(uniqueCategories[key] || [])
                      .filter((opt) =>
                        (queries[key] ?? "")
                          .toLowerCase()
                          .split(/\s+/)
                          .every((part) => opt.toLowerCase().includes(part))
                      )
                      .slice(0, 10)
                      .map((option) => (
                        <button
                          type="button"
                          key={option}
                          className="w-full text-right px-3 py-2 hover:bg-gray-700"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setSong((prev) => ({ ...prev, [key]: option }) as any);
                            setQueries((prev) => ({ ...prev, [key]: option }));
                            setOpenKey(null);
                          }}
                        >
                          {option}
                        </button>
                      ))}
                    {uniqueCategories[key].length === 0 && (
                      <div className="px-3 py-2 text-gray-400">אין הצעות</div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          <div className="col-span-2 flex gap-4">
            <button
              type="submit"
              className={`flex-1 py-2 px-4 rounded-md shadow-sm text-sm font-medium text-white ${
                isEditing
                  ? "bg-blue-600 hover:bg-blue-500"
                  : "bg-green-600 hover:bg-green-500" // ירוק להוספה
              }`}
            >
              {isEditing ? "✔️ שמירת שינויים" : "➕ הוסף שיר חדש"}
            </button>
            {isEditing && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="w-1/4 py-2 px-4 rounded-md shadow-sm text-sm font-medium bg-gray-600 hover:bg-gray-500 text-white"
              >
                ביטול
              </button>
            )}
          </div>
        </form>
      </section>

      {/* יבוא מ-Excel */}
      <section className="mb-8 p-6 rounded-lg shadow-md bg-gray-900">
        <h2 className="text-2xl font-semibold mb-4 text-white">
          ייבוא שירים מ-Excel
        </h2>
        <div className="flex flex-col gap-4">
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-700 file:text-teal-400 hover:file:bg-gray-600"
          />
          <button
            onClick={handleImportExcel}
            disabled={excelData.length === 0}
            className={`py-2 px-4 rounded-md shadow-sm text-sm font-medium text-white ${
              excelData.length > 0
                ? "bg-purple-600 hover:bg-purple-700"
                : "bg-gray-600 cursor-not-allowed"
            }`}
          >
            ייבא {excelData.length} שירים ל-Firebase
          </button>
        </div>
      </section>
    </main>
  );
}
