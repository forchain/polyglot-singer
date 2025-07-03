import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { dev } from '$app/environment';
import * as schema from './schema.js';

// Create SQLite database connection
const sqlite = new Database(dev ? 'dev.db' : 'production.db');

// Enable WAL mode for better performance
sqlite.pragma('journal_mode = WAL');

// Create Drizzle instance
export const db = drizzle(sqlite, { schema });

// Export database instance for direct queries if needed
export { sqlite }; 