import { json } from '@sveltejs/kit';
import { db, schema } from '$lib/server/database/connection';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
  const user = locals.user;
  if (!user) {
    return json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  const pref = await db.select().from(schema.userPreferences).where(eq(schema.userPreferences.userId, user.id)).limit(1);
  if (!pref[0]) {
    return json({ success: true, preferences: {} });
  }
  return json({ success: true, preferences: pref[0] });
};

export const POST: RequestHandler = async ({ locals, request }) => {
  const user = locals.user;
  if (!user) {
    return json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  const { defaultVoices } = await request.json();
  const pref = await db.select().from(schema.userPreferences).where(eq(schema.userPreferences.userId, user.id)).limit(1);
  if (pref[0]) {
    await db.update(schema.userPreferences).set({ defaultVoices }).where(eq(schema.userPreferences.userId, user.id));
  } else {
    await db.insert(schema.userPreferences).values({ userId: user.id, defaultVoices });
  }
  return json({ success: true });
}; 