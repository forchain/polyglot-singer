import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { dev } from '$app/environment';
import { getBackendConfig } from '$lib/server/backend/config';
import { createPocketBaseClient } from '$lib/server/backend/pocketbase/client';
import { clearPocketBaseAuth } from '$lib/server/backend/pocketbase';

const cookieOptions = {
	path: '/',
	httpOnly: false,
	secure: !dev,
	sameSite: 'lax' as const
};

export const POST: RequestHandler = async ({ cookies, request }) => {
	const config = getBackendConfig();

	if (config.provider === 'pocketbase') {
		const pb = createPocketBaseClient(config);
		pb.authStore.loadFromCookie(request.headers.get('cookie') || '');
		return json({ success: true }, { headers: { 'set-cookie': clearPocketBaseAuth(pb) } });
	}

	cookies.delete('sb-access-token', cookieOptions);
	cookies.delete('sb-refresh-token', cookieOptions);
	cookies.delete('supabase-auth-token', cookieOptions);

	return json({ success: true });
};
