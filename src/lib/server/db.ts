import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { join } from 'path';

const DB_PATH = process.env.DATABASE_PATH ?? join(process.cwd(), 'database.db');
const sqlite = new Database(DB_PATH);
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');

export const db = drizzle(sqlite);
