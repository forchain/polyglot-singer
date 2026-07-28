import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/private';
import { dev } from '$app/environment';
import { getBackendConfig } from '$lib/server/backend/config';
import { createPocketBaseClient } from '$lib/server/backend/pocketbase/client';
import { registerWithPocketBase } from '$lib/server/backend/pocketbase';
import { normalizeSupabaseUser } from '$lib/server/backend/postgres';

const cookieOptions = {
	path: '/',
	httpOnly: false,
	secure: !dev,
	sameSite: 'lax' as const
};

export const POST: RequestHandler = async ({ request, cookies }) => {
	const { email, password } = await request.json();
	const config = getBackendConfig();

	if (config.provider === 'pocketbase') {
		const pb = createPocketBaseClient(config);
		const result = await registerWithPocketBase(pb, email, password);
		return json({ success: true, user: result.user }, { headers: { 'set-cookie': result.cookie || '' } });
	}

	const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
	const { data, error } = await supabase.auth.signUp({ email, password });
	if (error) {
		return json({ success: false, error: error.message }, { status: 400 });
	}

	if (data.session) {
		cookies.set('sb-access-token', data.session.access_token, cookieOptions);
		cookies.set('sb-refresh-token', data.session.refresh_token, cookieOptions);
	}

	return json({
		success: true,
		user: normalizeSupabaseUser(data.user),
		message: data.session ? '注册成功' : '注册成功，请查收邮箱激活！'
	});
};
