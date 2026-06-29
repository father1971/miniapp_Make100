import { db } from "./src/db";
import { users } from "./src/db/schema";
import { eq } from "drizzle-orm";

async function run() {
  const tgId = 609214717; // Example real-sized TG ID
  
  const payload = {
    firstName: "Real",
    lastName: "User",
    username: "realuser",
    avatarUrl: "http://example.com/avatar.jpg",
    solvedCount: 10,
    skippedCount: 2,
    bestTimeMs: 12000,
    minCharacters: 4,
    totalTimeMs: 50000,
    totalCharacters: 20,
    settings: {
      themePreference: "dark"
    }
  };

  try {
    const existingUser = await db.select().from(users).where(eq(users.id, tgId));
    
    if (existingUser.length > 0) {
      await db.update(users).set({
        ...payload,
        settings: JSON.stringify(payload.settings),
        lastSavedAt: new Date()
      }).where(eq(users.id, tgId));
      console.log("Updated");
    } else {
      await db.insert(users).values({
        id: tgId,
        firstName: payload.firstName || 'Guest',
        lastName: payload.lastName || null,
        username: payload.username || null,
        avatarUrl: payload.avatarUrl || null,
        solvedCount: payload.solvedCount || 0,
        skippedCount: payload.skippedCount || 0,
        bestTimeMs: payload.bestTimeMs || null,
        minCharacters: payload.minCharacters || null,
        totalTimeMs: payload.totalTimeMs || 0,
        totalCharacters: payload.totalCharacters || 0,
        settings: JSON.stringify(payload.settings),
        lastSavedAt: new Date(),
      });
      console.log("Inserted");
    }
  } catch (e: any) {
    console.error("Error saving:", e.message);
  }
}

run();
