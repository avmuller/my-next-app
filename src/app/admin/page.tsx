"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import * as XLSX from "xlsx";

export default function AdminPage() {
  const [song, setSong] = useState({
    title: "",
    artist: "",
    key: "",
    genres: "",
    event: "",
    theme: "",
    styles: "",
    composer: "",
    singer: "",
    season: "",
    album: "",
    hasidut: "",
    lyrics: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      await addDoc(collection(db, "songs"), {
        ...song,
        event: song.event.split(",").map((e) => e.trim()),
        styles: song.styles.split(",").map((s) => s.trim()),
        createdAt: new Date(),
      });
      setMessage("✅ השיר נוסף בהצלחה!");
      setSong({
        title: "",
        artist: "",
        key: "",
        genres: "",
        event: "",
        theme: "",
        styles: "",
        composer: "",
        singer: "",
        season: "",
        album: "",
        hasidut: "",
        lyrics: "",
      });
    } catch (err) {
      console.error(err);
      setMessage("❌ שגיאה בהוספת שיר");
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSong({ ...song, [e.target.name]: e.target.value });
  }

  async function handleImportExcel(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setMessage("מייבא קובץ...");

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData: any[] = XLSX.utils.sheet_to_json(sheet);

      for (const row of jsonData) {
        const newSong = {
          title: row["Song"] || "",
          key: row["Key"] || "",
          genres: row["Genre"] || "", // שינוי מהמרה למערך למחרוזת פשוטה
          theme: row["Theme"] || "",
          composer: row["Composer"] || "",
          singer: row["Singer"] || "",
          season: row["Season"] || "",
          event: row["Event"] || "",
          album: row["Album"] || "",
          hasidut: row["hasidut"] || "",
          lyrics: row["Lyrics"] || "",
          createdAt: new Date(),
        };
        await addDoc(collection(db, "songs"), newSong);
      }
      setMessage("✅ הקובץ יובא בהצלחה!");
    } catch (err) {
      console.error(err);
      setMessage("❌ שגיאה בייבוא הקובץ");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-center text-indigo-700">
        ניהול שירים 🎵
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {Object.keys(song).map((field) => (
          <div key={field} className="flex flex-col">
            <label className="font-semibold mb-1">{field.toUpperCase()}</label>
            <input
              type="text"
              name={field}
              value={(song as any)[field]}
              onChange={handleChange}
              className="input border border-gray-300 rounded-lg p-2"
            />
          </div>
        ))}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-2 rounded-lg hover:opacity-90 transition"
        >
          {loading ? "מוסיף..." : "➕ הוסף שיר חדש"}
        </button>
      </form>

      <div className="pt-4 border-t border-gray-300">
        <label className="block font-semibold mb-2">ייבוא מקובץ Excel:</label>
        <input type="file" accept=".xlsx,.xls" onChange={handleImportExcel} />
      </div>

      {message && (
        <p className="text-center font-semibold text-green-600">{message}</p>
      )}
    </div>
  );
}
