import { json } from '@sveltejs/kit';
import { db } from '$lib/server/database/connection';
import { analyzedLyrics } from '$lib/server/database/schema';
import { eq, desc } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
	const user = locals.user;
	const userId = user?.id || 'anonymous';
	const rows = await db.select({
		id: analyzedLyrics.id,
		title: analyzedLyrics.title,
		artist: analyzedLyrics.artist,
		createdAt: analyzedLyrics.createdAt
	}).from(analyzedLyrics).where(eq(analyzedLyrics.userId, userId)).orderBy(desc(analyzedLyrics.createdAt));
	return json({ success: true, history: rows });
}; 