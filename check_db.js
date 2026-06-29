import { db } from "./src/db/index.js";
import { users } from "./src/db/schema.js";

async function run() {
  try {
    const res = await db.select().from(users);
    console.log("Users:", res);
  } catch(e) {
    console.error("Error:", e);
  }
}

run();
