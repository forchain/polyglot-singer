import { Lucia } from 'lucia';
import { DrizzleSQLiteAdapter } from '@lucia-auth/adapter-drizzle';
import { db, databaseType } from '$lib/server/database/connection.js';
import { dev } from '$app/environment';

// For now, we'll use SQLite adapter as the default
// TODO: Add proper PostgreSQL support once adapter is configured
let adapter: any;

if (databaseType === 'postgres' || databaseType === 'supabase') {
	// For now, throw an error for PostgreSQL until we fix the adapter
	throw new Error('PostgreSQL support is not yet fully implemented. Please use SQLite for now.');
} else {
	// Import SQLite schema
	const { users, sessions } = await import('$lib/server/database/schema.js');
	// @ts-ignore - Temporary fix for type issues
	adapter = new DrizzleSQLiteAdapter(db, sessions, users);
}

// Initialize Lucia
export const lucia = new Lucia(adapter, {
	sessionCookie: {
		attributes: {
			// Set to `true` when using HTTPS
			secure: !dev
		}
	},
	getUserAttributes: (attributes) => {
		return {
			// attributes has the type of DatabaseUserAttributes
			username: attributes.username,
			email: attributes.email,
			displayName: attributes.display_name,
			createdAt: attributes.created_at
		};
	}
});

// Type declarations for Lucia
declare module 'lucia' {
	interface Register {
		Lucia: typeof lucia;
		DatabaseUserAttributes: {
			username: string;
			email: string;
			display_name: string | null;
			created_at: number | Date;
		};
	}
} 