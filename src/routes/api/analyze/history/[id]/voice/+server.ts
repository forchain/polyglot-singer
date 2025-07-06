import { json } from '@sveltejs/kit';
import { db, schema } from '$lib/server/database/connection';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ params, request, locals }) => {
  const user = locals.user;
  if (!user) {
    return json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  const id = params.id;
  const { voice } = await request.json();
  // 只允许操作自己的分析记录
  const row = await db.select().from(schema.analyzedLyrics).where(eq(schema.analyzedLyrics.id, id)).limit(1);
  if (!row[0] || row[0].userId !== user.id) {
    return json({ success: false, error: 'Not found' }, { status: 404 });
  }
  await db.update(schema.analyzedLyrics).set({ voice }).where(eq(schema.analyzedLyrics.id, id));
  return json({ success: true });
}; 