import { Lucia } from 'lucia';
import { DrizzleSQLiteAdapter } from '@lucia-auth/adapter-drizzle';
import { db } from '$lib/server/database/connection.js';
import { users, sessions } from '$lib/server/database/schema.js';
import { dev } from '$app/environment';

// Create Drizzle adapter for Lucia
const adapter = new DrizzleSQLiteAdapter(db, sessions, users);

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
			created_at: number;
		};
	}
} 