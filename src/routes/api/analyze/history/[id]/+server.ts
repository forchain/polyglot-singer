import { json } from '@sveltejs/kit';
import { db, schema } from '$lib/server/database/connection';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, locals }) => {
	const user = locals.user;
	const id = params.id;
	const row = await db.select().from(schema.analyzedLyrics).where(eq(schema.analyzedLyrics.id, id)).limit(1);
	if (!row[0]) {
		return json({ success: false, error: 'Not found' }, { status: 404 });
	}
	const isPublic = row[0].isPublic || false;
	// 公开作品允许任何人访问，私有作品仅作者本人可访问
	if (!isPublic && (!user || row[0].userId !== user.id)) {
		return json({ success: false, error: 'Not found' }, { status: 404 });
	}
	const analysis = { ...JSON.parse(row[0].analysisJson), id: row[0].id };
	const voice = row[0].voice || null;
	return json({ success: true, analysis, voice, isPublic });
}; 