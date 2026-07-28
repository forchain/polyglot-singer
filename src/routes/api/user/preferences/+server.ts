import { json } from '@sveltejs/kit';
import { getBackendRepositories } from '$lib/server/backend';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
  const user = locals.user;
  if (!user) {
    return json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  const pref = await (await getBackendRepositories()).preferences.get(user.id);
  if (!pref) {
    return json({ success: true, preferences: {} });
  }
  return json({ success: true, preferences: pref });
};

export const POST: RequestHandler = async ({ locals, request }) => {
  const user = locals.user;
  if (!user) {
    return json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  const { defaultVoices } = await request.json();
  await (await getBackendRepositories()).preferences.upsert(user.id, { defaultVoices });
  return json({ success: true });
};
