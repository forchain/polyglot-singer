import { json } from '@sveltejs/kit';
import { db, schema } from '$lib/server/database/connection';
import { eq } from 'drizzle-orm';

export const PATCH = async ({ params, request, locals }) => {
  const { id } = params;
  const user = locals.user;
  if (!user) {
    return json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  const { isPublic } = await request.json();
  // 只允许修改自己的作品
  const updated = await db.update(schema.analyzedLyrics)
    .set({ isPublic })
    .where(eq(schema.analyzedLyrics.id, id), eq(schema.analyzedLyrics.userId, user.id));
  return json({ success: true });
}; 