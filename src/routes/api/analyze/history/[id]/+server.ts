import { json } from '@sveltejs/kit';
import { db } from '$lib/server/database/connection';
import { analyzedLyrics } from '$lib/server/database/schema';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, locals }) => {
	const user = locals.user;
	const userId = user?.id || 'anonymous';
	const id = params.id;
	const row = await db.select().from(analyzedLyrics).where(eq(analyzedLyrics.id, id)).limit(1);
	if (!row[0] || row[0].userId !== userId) {
		return json({ success: false, error: 'Not found' }, { status: 404 });
	}
	return json({ success: true, analysis: JSON.parse(row[0].analysisJson) });
}; 