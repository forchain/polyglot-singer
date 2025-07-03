import type { Handle } from '@sveltejs/kit';
import { lucia } from '$lib/server/services/auth-service.js';

export const handle: Handle = async ({ event, resolve }) => {
	// Get session ID from cookies
	const sessionId = event.cookies.get(lucia.sessionCookieName);
	
	if (!sessionId) {
		event.locals.user = null;
		event.locals.session = null;
		return resolve(event);
	}

	// Validate session
	const { session, user } = await lucia.validateSession(sessionId);
	
	if (session && session.fresh) {
		// Refresh session cookie
		const sessionCookie = lucia.createSessionCookie(session.id);
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});
	}
	
	if (!session) {
		// Remove invalid session cookie
		const sessionCookie = lucia.createBlankSessionCookie();
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});
	}

	// Set locals for use in pages and endpoints
	event.locals.user = user;
	event.locals.session = session;

	return resolve(event);
}; 