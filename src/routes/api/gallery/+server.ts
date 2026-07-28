import { json } from '@sveltejs/kit';
import { getBackendRepositories } from '$lib/server/backend';

export const GET = async () => {
  const data = await (await getBackendRepositories()).analysis.listPublic(100);

  return json({ success: true, data });
}; 
