import { json } from '@sveltejs/kit';
import { getBackendRepositories } from '$lib/server/backend';

export const PATCH = async ({ params, request, locals }) => {
  const { id } = params;
  const user = locals.user;
  if (!user) {
    return json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  const { isPublic } = await request.json();
  await (await getBackendRepositories()).analysis.updatePublic(id, user.id, isPublic);
  return json({ success: true });
};
