import { json } from '@sveltejs/kit';
import { getBackendRepositories } from '$lib/server/backend';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ params, request, locals }) => {
  const user = locals.user;
  if (!user) {
    return json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  const id = params.id;
  const { voice } = await request.json();
  const updated = await (await getBackendRepositories()).analysis.updateVoice(id, user.id, voice);
  if (!updated) {
    return json({ success: false, error: 'Not found' }, { status: 404 });
  }
  return json({ success: true });
};
