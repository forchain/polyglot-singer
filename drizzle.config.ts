import type { Config } from 'drizzle-kit';

const config: Config = {
	out: './drizzle',
	schema: './src/lib/server/database/schema.ts',
	dialect: 'postgresql',
	dbCredentials: {
		url: process.env.DATABASE_URL || 'postgresql://localhost:5432/polyglot_singer'
	}
};

export default config; 