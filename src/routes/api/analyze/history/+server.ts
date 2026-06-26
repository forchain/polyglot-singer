import { json } from '@sveltejs/kit';
import { getBackendRepositories } from '$lib/server/backend';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
	const user = locals.user;
	
	if (!user) {
		return json({ success: false, error: 'Unauthorized' }, { status: 401 });
	}
	
	const rows = await (await getBackendRepositories()).analysis.listForUser(user.id);
	return json({ success: true, history: rows });
};
