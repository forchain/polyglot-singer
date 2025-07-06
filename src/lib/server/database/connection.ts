import { drizzle } from 'drizzle-orm/better-sqlite3';
import { drizzle as drizzlePg } from 'drizzle-orm/postgres-js';
import Database from 'better-sqlite3';
import postgres from 'postgres';
import { dev } from '$app/environment';
import { DATABASE_URL } from '$env/static/private';
import { env } from '$env/dynamic/private';

// Import schemas
import * as schemaSqlite from './schema.js';
import * as schemaPg from './schema-pg.js';

// Database type from environment
const dbType = env.DATABASE_TYPE || 'sqlite';

let db: any;
let sqlite: Database.Database | null = null;
let pg: postgres.Sql | null = null;

if (dbType === 'postgres' || dbType === 'supabase') {
	// PostgreSQL/Supabase connection
	const connectionString = DATABASE_URL || 'postgresql://localhost:5432/polyglot_singer';
	pg = postgres(connectionString);
	db = drizzlePg(pg, { schema: schemaPg });
} else {
	// SQLite connection (default)
	const dbPath = DATABASE_URL?.replace('sqlite:', '') || (dev ? 'dev.db' : 'production.db');
	sqlite = new Database(dbPath);
	
	// Enable WAL mode for better performance
	sqlite.pragma('journal_mode = WAL');
	
	db = drizzle(sqlite, { schema: schemaSqlite });
}

// Export database instance
export { db };

// Export raw database instances if needed
export { sqlite, pg };

// Export database type
export const databaseType = dbType;

// Export schema based on database type
export const schema = dbType === 'postgres' || dbType === 'supabase' ? schemaPg : schemaSqlite; 