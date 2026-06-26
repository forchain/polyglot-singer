import { json } from '@sveltejs/kit';
import { getBackendRepositories } from '$lib/server/backend';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, locals }) => {
	const user = locals.user;
	const id = params.id;
	const row = await (await getBackendRepositories()).analysis.getAccessible(id, user?.id);
	if (!row) {
		return json({ success: false, error: 'Not found' }, { status: 404 });
	}
	const isPublic = row.isPublic || false;
	const analysis = { ...JSON.parse(row.analysisJson), id: row.id };
	const voice = row.voice || null;
	return json({ success: true, analysis, voice, isPublic });
};
