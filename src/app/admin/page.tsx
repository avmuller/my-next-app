// src/app/admin/page.tsx
// Purpose: Server component wrapper for the Admin UI.
// Handles initial data fetch (Server-Side) and security checks (to be implemented).
// Renders the Client components for interaction.

import { getAdminInitialData, fetchSongForEditAction } from "./actions";
import AdminUIWrapper from "@/components/Admin/AdminUIWrapper"; // <-- ייבוא הרכיב הלקוח הנכון
import type { SongForm as SongFormType } from "@/types/song";
import { redirect } from "next/navigation";
import React from "react";

// Temporary interface for server-fetched data normalization
interface FormReadySong extends SongFormType {
  id: string;
}

// **********************************************
// TODO: SECURITY CHECK PLACEHOLDER (Will be implemented in the next phase)
// This check will use Firebase Admin SDK to verify the user session.
const isAdminAuthenticated = async (): Promise<boolean> => {
  // Return true FOR NOW to load the UI for development.
  // Replace with actual server-side authentication check later.
  return true;
};
// **********************************************

export default async function AdminPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const editIdFromURL = searchParams?.editId as string;

  // 1. **SERVER SECURITY CHECK (Placeholder)**
  const isAdmin = await isAdminAuthenticated();
  if (!isAdmin) {
    // Once login is implemented, redirect non-admins
    // redirect("/login");
  }

  // 2. **SERVER DATA FETCH**
  // Fetch both all songs and unique categories once on the server
  const initialData = await getAdminInitialData();
  let songToEdit: FormReadySong | null = null;

  // 3. **CONDITIONAL FETCH FOR EDITING**
  if (editIdFromURL) {
    // Fetch specific song data only on the server
    songToEdit = (await fetchSongForEditAction(
      editIdFromURL
    )) as FormReadySong | null;
    if (!songToEdit) {
      redirect("/admin"); // Redirect if ID is invalid or unauthorized
    }
  }

  // 4. Render the Client Wrapper, passing server-fetched data as props
  // שימו לב: AdminUIWrapper הוא קובץ נפרד שמתחיל ב-"use client";
  return (
    <AdminUIWrapper
      initialAllSongs={initialData.allSongs}
      uniqueCategories={initialData.uniqueCategories}
      songToEdit={songToEdit}
    />
  );
}
