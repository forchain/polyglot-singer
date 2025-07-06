import type { Handle } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '$env/static/private';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const handle: Handle = async ({ event, resolve }) => {
	const access_token = event.cookies.get('sb-access-token') || event.cookies.get('supabase-auth-token');
	if (access_token) {
		const { data, error } = await supabase.auth.getUser(access_token);
		event.locals.user = data?.user ?? null;
	} else {
		event.locals.user = null;
	}
	return resolve(event);
}; 