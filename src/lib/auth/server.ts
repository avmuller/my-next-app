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

const getBearerToken = (request?: Request): string | null => {
  if (!request) return null;
  const header = request.headers.get("authorization");
  if (!header) return null;
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : null;
};

export const requireAuthenticatedUser = async (
  request?: Request
): Promise<SessionUser> => {
  const auth = getAdminAuth();
  const bearer = getBearerToken(request);
  if (bearer) {
    try {
      return await auth.verifyIdToken(bearer, true);
    } catch {
      // Fallback to cookie verification
    }
  }
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
};
