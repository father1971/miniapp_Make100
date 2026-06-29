import { db } from "./src/db";
import { users } from "./src/db/schema";
import { sql } from "drizzle-orm";

async function run() {
  try {
    const res = await db.select().from(users);
    console.log("Users:", res);
  } catch(e: any) {
    console.error("Error selecting users:", e.message);
  }

  try {
    await db.run(sql`SELECT 1`);
    console.log("DB connection ok.");
  } catch(e: any) {
    console.error("Error running raw SQL:", e.message);
  }
}

run();
