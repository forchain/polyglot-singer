import { Lucia } from 'lucia';
import { PostgresJsAdapter } from '@lucia-auth/adapter-postgresql';
import { db, pg } from '$lib/server/database/connection.js';
import { dev } from '$app/environment';

// Import PostgreSQL schema
const { users, sessions } = await import('$lib/server/database/schema.js');

// Use PostgreSQL adapter
const adapter = new PostgresJsAdapter(pg!, {
	user: 'users',
	session: 'sessions'
});

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