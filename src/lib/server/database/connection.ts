import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { DATABASE_URL } from '$env/static/private';
import { env } from '$env/dynamic/private';

// Import PostgreSQL schema
import * as schema from './schema.js';

// Database type from environment (default to postgres)
const dbType = env.DATABASE_TYPE || 'postgres';

let db: any;
let pg: postgres.Sql | null = null;

// PostgreSQL/Supabase connection
const connectionString = DATABASE_URL || 'postgresql://localhost:5432/polyglot_singer';
pg = postgres(connectionString);
db = drizzle(pg, { schema });

// Export database instance
export { db };

// Export raw database instance if needed
export { pg };

// Export database type
export const databaseType = dbType;

// Export schema
export { schema }; 