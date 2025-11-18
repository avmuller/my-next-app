// src/app/admin/page.tsx
import { getAdminInitialData, fetchSongForEditAction } from "./actions";
import AdminUIWrapper from "@/components/Admin/AdminUIWrapper";
import type { SongForm as SongFormType } from "@/types/song";
import { redirect } from "next/navigation";
import React from "react";
import { getCurrentUser } from "@/lib/auth/server";
import { ADMIN_DASHBOARD_PATH } from "@/lib/auth/constants";

interface FormReadySong extends SongFormType {
  id: string;
}

type AdminSearchParams = { [key: string]: string | string[] | undefined };

const isPromiseSearchParams = (
  value: unknown
): value is Promise<AdminSearchParams> => {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as { then?: unknown }).then === "function"
  );
};

export default async function AdminPage({
  searchParams,
}: {
  searchParams?: AdminSearchParams | Promise<AdminSearchParams>;
}) {
  let resolvedParams: AdminSearchParams | undefined = undefined;
  if (searchParams) {
    if (isPromiseSearchParams(searchParams)) {
      resolvedParams = await searchParams;
    } else {
      resolvedParams = searchParams;
    }
  }

  const editIdFromURL = resolvedParams?.editId as string | undefined;
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect(`/login?next=${encodeURIComponent(ADMIN_DASHBOARD_PATH)}`);
  }

  if (currentUser.admin !== true) {
    redirect("/");
  }

  const initialData = await getAdminInitialData();
  let songToEdit: FormReadySong | null = null;

  if (editIdFromURL) {
    songToEdit = (await fetchSongForEditAction(
      editIdFromURL
    )) as FormReadySong | null;
    if (!songToEdit) {
      redirect(ADMIN_DASHBOARD_PATH);
    }
  }

  return (
    <AdminUIWrapper
      initialAllSongs={initialData.allSongs}
      uniqueCategories={initialData.uniqueCategories}
      songToEdit={songToEdit}
    />
  );
}
