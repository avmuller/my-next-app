// src/lib/auth/server.ts
import { cookies } from "next/headers";
import type { DecodedIdToken } from "firebase-admin/auth";
import { getAdminAuth } from "@/lib/firebase-admin";
import { SESSION_COOKIE_NAME } from "./constants";

export type SessionUser = DecodedIdToken & { admin?: boolean };

export const verifySessionCookie = async (
  sessionCookie: string
): Promise<SessionUser | null> => {
  try {
    return await getAdminAuth().verifySessionCookie(sessionCookie, true);
  } catch {
    return null;
  }
};

export const getSessionCookie = async (): Promise<string | undefined> => {
  const store = await cookies();
  return store.get(SESSION_COOKIE_NAME)?.value;
};

export const getCurrentUser = async (): Promise<SessionUser | null> => {
  const cookie = await getSessionCookie();
  if (!cookie) return null;
  return await verifySessionCookie(cookie);
};

export const requireAdminUser = async (): Promise<SessionUser> => {
  const user = await getCurrentUser();
  if (!user || user.admin !== true) {
    throw new Error("Unauthorized");
  }
  return user;
};

export const requireAuthenticatedUser = async (): Promise<SessionUser> => {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
};
