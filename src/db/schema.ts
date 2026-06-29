import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey(), // Telegram user ID
  firstName: text('first_name').notNull(),
  lastName: text('last_name'),
  username: text('username'),
  avatarUrl: text('avatar_url'),
  
  solvedCount: integer('solved_count').notNull().default(0),
  skippedCount: integer('skipped_count').notNull().default(0),
  bestTimeMs: integer('best_time_ms'),
  minCharacters: integer('min_characters'),
  totalTimeMs: integer('total_time_ms').notNull().default(0),
  totalCharacters: integer('total_characters').notNull().default(0),
  
  settings: text('settings', { mode: 'json' }).notNull().default('{}'), // Store as JSON string
  lastSavedAt: integer('last_saved_at', { mode: 'timestamp' }).notNull(),
});
