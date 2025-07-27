import type { Handle } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '$env/static/private';
import { db, schema } from '$lib/server/database/connection';
import { eq } from 'drizzle-orm';

const supabase = createClient(
	SUPABASE_URL,
	SUPABASE_ANON_KEY
);

export const handle: Handle = async ({ event, resolve }) => {
	const access_token = event.cookies.get('sb-access-token') || event.cookies.get('supabase-auth-token');
	if (access_token) {
		try {
			const { data, error } = await supabase.auth.getUser(access_token);
			const user = data?.user ?? null;
			event.locals.user = user;

			// 自动同步到业务 users 表
			if (user) {
				try {
					const exist = await db.select().from(schema.users).where(eq(schema.users.id, user.id)).limit(1);
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
					// 不设置为null，保持用户登录状态
				}
			}
		} catch (error) {
			console.error('[Supabase认证] 连接失败:', error);
			// Supabase连接失败时，尝试从本地数据库获取用户信息
			try {
				// 这里可以添加从本地数据库获取用户信息的逻辑
				// 暂时设置为null，让用户重新登录
				event.locals.user = null;
				event.locals.supabaseError = '认证服务暂时不可用，请稍后重试';
			} catch (localError) {
				console.error('[本地认证] 也失败了:', localError);
				event.locals.user = null;
			}
		}
	} else {
		event.locals.user = null;
	}
	return resolve(event);
}; 