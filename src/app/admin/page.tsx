// src/app/admin/page.tsx
"use client";
import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import * as XLSX from "xlsx";
import { Song, SongForm } from "@/types/song"; // ייבוא הטיפוסים החדשים (ללא BPM)

// שינוי: הסרת BPM מהמצב ההתחלתי
const initialSongState: SongForm = {
  title: "",
  Beat: "", // **חדש: מצב התחלתי**
  Key: "",
  Genre: [],
  Event: [],
  Theme: "",
  Composer: "",
  Singer: "",
  Season: "",
  Album: "",
  hasidut: "",
  Lyrics: "",
};

export default function AdminPage() {
  const [song, setSong] = useState<SongForm>(initialSongState);
  const [message, setMessage] = useState("");
  const [excelData, setExcelData] = useState<any[]>([]);

  // פונקציית עזר לניקוי ופיצול מחרוזת למערך, או החזרת מערך ריק
  const splitAndClean = (value: string | string[]): string[] => {
    if (Array.isArray(value)) return value.filter((v) => v && v.trim() !== "");
    if (typeof value !== "string") return [];

    return value
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  };

  const handleManualChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setSong((prev) => ({ ...prev, [name]: value }));
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("מעבד...");

    try {
      const songData: Omit<Song, "id"> = {
        title: song.title,
        Beat: song.Beat, // **שימוש בשדה Beat**
        Key: song.Key,
        Genre: splitAndClean(song.Genre as unknown as string),
        Event: splitAndClean(song.Event as unknown as string),
        Theme: song.Theme,
        Composer: song.Composer,
        Singer: song.Singer,
        Season: song.Season,
        Album: song.Album,
        hasidut: song.hasidut,
        Lyrics: song.Lyrics,
        createdAt: new Date(),
      };

      const docRef = await addDoc(collection(db, "songs"), songData);
      setMessage(`השיר נוסף בהצלחה! ID: ${docRef.id}`);
      setSong(initialSongState);
    } catch (error) {
      console.error("Error adding document: ", error);
      setMessage("שגיאה בהוספת השיר. בדוק את הקונסול.");
    }
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
      setMessage(`קובץ Excel נטען. נמצאו ${json.length} שורות.`);
    };
    reader.readAsBinaryString(file);
  };

  const handleImportExcel = async () => {
    if (excelData.length === 0) {
      setMessage("לא נמצאו נתונים לייבוא.");
      return;
    }

    setMessage(`מייבא ${excelData.length} שירים...`);
    let successfulImports = 0;
    const songsCollection = collection(db, "songs");

    for (const row of excelData) {
      try {
        const songData: Omit<Song, "id"> = {
          title: row["Song"] || row["title"] || "",
          Beat: row["Beat"] || "", // **שימוש בשם העמודה Beat**
          Key: row["Key"] || "",
          Genre: splitAndClean(row["Genre"]),
          Event: splitAndClean(row["Event"]),
          Theme: row["Theme"] || "",
          Composer: row["Composer"] || "",
          Singer: row["Singer"] || "",
          Season: row["Season"] || "",
          Album: row["Album"] || "",
          hasidut: row["hasidut"] || "",
          Lyrics: row["Lyrics"] || "",
          createdAt: new Date(),
        };

        await addDoc(songsCollection, songData);
        successfulImports++;
      } catch (e) {
        console.error("שגיאה בייבוא שיר: ", row, e);
      }
    }

    setMessage(`הייבוא הסתיים! ${successfulImports} שירים יובאו בהצלחה.`);
    setExcelData([]);
  };

  const formFields = Object.keys(initialSongState);

  return (
    <main className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-center">פנל ניהול שירים</h1>

      {/* הודעות סטטוס */}
      {message && (
        <div className="alert alert-info mb-4 p-3 bg-blue-100 text-blue-800 rounded">
          {message}
        </div>
      )}

      {/* טופס הוספה ידנית */}
      <section className="mb-8 border p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">הוספת שיר יחיד</h2>
        <form onSubmit={handleManualSubmit} className="grid grid-cols-2 gap-4">
          {/* שינוי: רשימת השדות לא כוללת BPM */}
          {formFields.map((key) => (
            <div key={key}>
              <label
                htmlFor={key}
                className="block text-sm font-medium text-gray-300"
              >
                {key.charAt(0).toUpperCase() + key.slice(1)}
                {/* הערה לשדות המערך */}
                {["genres", "styles", "events"].includes(key) &&
                  " (מופרד בפסיקים)"}
              </label>
              <input
                type={"text"} // כל השדות חזרו ל-text
                name={key}
                id={key}
                value={(song as any)[key]}
                onChange={handleManualChange}
                required={key === "title" || key === "artist" || key === "key"}
                className="mt-1 block w-full border border-gray-600 rounded-md shadow-sm p-2 bg-gray-700 text-gray-50 placeholder-gray-400"
              />
            </div>
          ))}
          <div className="col-span-2">
            <button
              type="submit"
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              הוסף שיר
            </button>
          </div>
        </form>
      </section>

      {/* יבוא מ-Excel */}
      <section className="mb-8 border p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">ייבוא שירים מ-Excel</h2>
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
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            ייבא {excelData.length} שירים ל-Firebase
          </button>
        </div>
      </section>
    </main>
  );
}
