import { json } from '@sveltejs/kit';
import { db, schema } from '$lib/server/database/connection';
import { eq, desc } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
	const user = locals.user;
	const userId = user?.id || 'anonymous';
	const rows = await db.select({
		id: schema.analyzedLyrics.id,
		title: schema.analyzedLyrics.title,
		artist: schema.analyzedLyrics.artist,
		createdAt: schema.analyzedLyrics.createdAt
	}).from(schema.analyzedLyrics).where(eq(schema.analyzedLyrics.userId, userId)).orderBy(desc(schema.analyzedLyrics.createdAt));
	return json({ success: true, history: rows });
}; 