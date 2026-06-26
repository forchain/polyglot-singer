import type { Handle } from '@sveltejs/kit';
import { getBackendConfig, type BackendProviderName } from './config';
import type { BackendRepositories } from './types';
import { createPocketBaseClient, createPocketBaseClientBundle } from './pocketbase/client';
import { createPocketBaseRepositories, refreshPocketBaseAuth } from './pocketbase';
import { createClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/private';

type EnvLike = Record<string, string | undefined>;

export function getBackendProviderName(source?: EnvLike): BackendProviderName {
	return getBackendConfig(source).provider;
}

export async function getBackendRepositories(): Promise<BackendRepositories> {
	const config = getBackendConfig();
	if (config.provider === 'pocketbase') {
		return createPocketBaseRepositories(createPocketBaseClientBundle(config));
	}

	const { createPostgresRepositories } = await import('./postgres');
	return createPostgresRepositories();
}

async function syncSupabaseUser(user: any) {
	const { db, schema } = await import('$lib/server/database/connection');
	const { eq } = await import('drizzle-orm');
	const { normalizeSupabaseUser } = await import('./postgres');
	const appUser = normalizeSupabaseUser(user);
	if (!appUser?.id || !appUser.email) {
		return appUser;
	}

	const exist = await db.select().from(schema.users).where(eq(schema.users.id, appUser.id)).limit(1);
	if (!exist[0]) {
		await db.insert(schema.users).values({
			id: appUser.id,
			email: appUser.email,
			username: appUser.username || appUser.email,
			display_name: appUser.displayName || null,
			created_at: new Date()
		});
	}

	return appUser;
}

export const handleBackendAuth: Handle = async ({ event, resolve }) => {
	const config = getBackendConfig();

	if (config.provider === 'pocketbase') {
		const pb = createPocketBaseClient(config);
		pb.authStore.loadFromCookie(event.request.headers.get('cookie') || '');
		event.locals.pb = pb;
		event.locals.user = await refreshPocketBaseAuth(pb);

		const response = await resolve(event);
		response.headers.append('set-cookie', pb.authStore.exportToCookie());
		return response;
	}

	const supabaseUrl = env.SUPABASE_URL;
	const supabaseAnonKey = env.SUPABASE_ANON_KEY;
	const accessToken = event.cookies.get('sb-access-token') || event.cookies.get('supabase-auth-token');

	event.locals.user = null;

	if (supabaseUrl && supabaseAnonKey && accessToken) {
		const supabase = createClient(supabaseUrl, supabaseAnonKey);
		const { data } = await supabase.auth.getUser(accessToken);
		if (data?.user) {
			try {
				event.locals.user = await syncSupabaseUser(data.user);
			} catch (error) {
				console.error('[用户同步] 插入users表失败:', error);
				event.locals.userSyncError = '用户信息同步到业务表失败';
				event.locals.user = null;
			}
		}
	}

	return resolve(event);
};
