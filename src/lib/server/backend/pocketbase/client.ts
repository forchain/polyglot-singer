import PocketBase from 'pocketbase';
import { getBackendConfig, type BackendConfig } from '../config';

export interface PocketBaseClientBundle {
	publicClient: PocketBase;
	getSuperuserClient: () => Promise<PocketBase>;
}

export function createPocketBaseClient(config: BackendConfig = getBackendConfig()): PocketBase {
	if (config.provider !== 'pocketbase' || !config.pocketbaseUrl) {
		throw new Error('POCKETBASE_URL is required when BACKEND_PROVIDER=pocketbase');
	}

	return new PocketBase(config.pocketbaseUrl);
}

export async function createPocketBaseSuperuserClient(
	config: BackendConfig = getBackendConfig()
): Promise<PocketBase> {
	if (config.provider !== 'pocketbase' || !config.pocketbaseUrl) {
		throw new Error('POCKETBASE_URL is required when BACKEND_PROVIDER=pocketbase');
	}
	if (!config.pocketbaseSuperuserEmail || !config.pocketbaseSuperuserPassword) {
		throw new Error('PocketBase superuser credentials are required for this operation');
	}

	const client = new PocketBase(config.pocketbaseUrl);
	await client
		.collection('_superusers')
		.authWithPassword(config.pocketbaseSuperuserEmail, config.pocketbaseSuperuserPassword);
	return client;
}

export function createPocketBaseClientBundle(config: BackendConfig = getBackendConfig()): PocketBaseClientBundle {
	return {
		publicClient: createPocketBaseClient(config),
		getSuperuserClient: () => createPocketBaseSuperuserClient(config)
	};
}
