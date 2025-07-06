import type { Handle } from '@sveltejs/kit';
import type { Locals } from './app.d.ts';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '$env/static/private';
import { db, schema } from '$lib/server/database/connection';
import { eq } from 'drizzle-orm';

const supabase = createClient(
	SUPABASE_URL,
	SUPABASE_ANON_KEY
);

export const handle: Handle = async ({ event, resolve }) => {
	console.log('[hooks] handle called at', new Date().toISOString());
	const access_token = event.cookies.get('sb-access-token') || event.cookies.get('supabase-auth-token');
	console.log('[hooks] 获取 access_token:', access_token ? '存在' : '不存在');
	if (access_token) {
		const { data, error } = await supabase.auth.getUser(access_token);
		const user = data?.user ?? null;
		console.log('[hooks] supabase.auth.getUser 返回:', user ? user.id : '无用户', error ? error.message : '无错误');
		event.locals.user = user;

		// 自动同步到业务 users 表
		if (user) {
			try {
				const exist = await db.select().from(schema.users).where(eq(schema.users.id, user.id)).limit(1);
				console.log('[用户同步] users表查找:', exist && exist[0] ? '已存在' : '未找到', user.id);
				if (!exist[0]) {
					console.log('[用户同步] users表无记录，准备插入:', {
						id: user.id,
						email: user.email
					});
					await db.insert(schema.users).values({
						id: user.id,
						email: user.email,
						username: user.email,
						display_name: null,
						created_at: new Date()
					});
					console.log('[用户同步] 插入users表成功:', user.id);
				}
			} catch (e) {
				console.error('[用户同步] 插入users表失败:', {
					userId: user.id,
					email: user.email,
					error: e
				});
				event.locals.userSyncError = '用户信息同步到业务表失败';
				event.locals.user = null;
			}
		}
	} else {
		event.locals.user = null;
		console.log('[hooks] 未获取到 access_token，设为未登录');
	}
	return resolve(event);
}; 