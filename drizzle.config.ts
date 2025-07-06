import type { Config } from 'drizzle-kit';

const databaseType = process.env.DATABASE_TYPE || 'sqlite';

const config: Config = {
	out: './drizzle',
	...(databaseType === 'postgres' || databaseType === 'supabase' 
		? {
			schema: './src/lib/server/database/schema-pg.ts',
			dialect: 'postgresql',
			dbCredentials: {
				url: process.env.DATABASE_URL || 'postgresql://localhost:5432/polyglot_singer'
			}
		}
		: {
			schema: './src/lib/server/database/schema.ts',
			dialect: 'sqlite',
			dbCredentials: {
				url: process.env.DATABASE_URL?.replace('sqlite:', '') || './dev.db'
			}
		})
};

export default config; 