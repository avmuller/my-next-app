// src/lib/firebaseClient.ts
// Client-only Firebase initialization for Authentication flows.
"use client";

import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  browserLocalPersistence,
  setPersistence,
} from "firebase/auth";
import { firebaseConfig } from "./firebase-config";

const clientApp = getApps().length
  ? getApps()[0]
  : initializeApp(firebaseConfig);

export const auth = getAuth(clientApp);
export const googleProvider = new GoogleAuthProvider();

if (typeof window !== "undefined") {
  setPersistence(auth, browserLocalPersistence).catch(() => {
    // Ignore persistence errors (e.g., private mode). Auth will fallback to memory.
  });
}
