// scripts/set-admin.ts
// Usage: ts-node scripts/set-admin.ts <uid> [true|false]
//
// Sets or unsets the custom "admin" claim for a Firebase Auth user.
// Requires the same FIREBASE_* environment variables as the app.

import { getAdminAuth } from "@/lib/firebase-admin";

const printUsage = () => {
  console.log("Usage: ts-node scripts/set-admin.ts <uid> [true|false]");
};

async function main() {
  const [, , uid, flag] = process.argv;
  if (!uid) {
    printUsage();
    process.exit(1);
  }

  const isAdmin =
    typeof flag === "string" ? flag.toLowerCase() === "true" : true;

  try {
    const auth = getAdminAuth();
    await auth.setCustomUserClaims(uid, { admin: isAdmin });
    console.log(
      `✅ Updated user ${uid}. Admin claim set to ${isAdmin ? "true" : "false"}.`
    );
    console.log("Ask the user to sign out/in so the claim refreshes.");
  } catch (error) {
    console.error("Failed to update admin claim:", error);
    process.exit(1);
  }
}

main();
