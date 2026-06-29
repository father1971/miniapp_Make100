import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { db } from './src/db/index.ts';

async function run() {
  await db.run(sql`DROP TABLE IF EXISTS users`);
  console.log("Dropped table");
}
run();
