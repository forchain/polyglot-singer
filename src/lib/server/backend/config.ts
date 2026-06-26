import { env as dynamicEnv } from '$env/dynamic/private';

export type BackendProviderName = 'postgres' | 'pocketbase';

export interface BackendConfig {
	provider: BackendProviderName;
	pocketbaseUrl?: string;
	pocketbaseSuperuserEmail?: string;
	pocketbaseSuperuserPassword?: string;
}

type EnvLike = Record<string, string | undefined>;

export function getBackendConfig(source: EnvLike = dynamicEnv): BackendConfig {
	const provider = source.BACKEND_PROVIDER || 'postgres';

	if (provider !== 'postgres' && provider !== 'pocketbase') {
		throw new Error(`Unsupported BACKEND_PROVIDER: ${provider}`);
	}

	if (provider === 'postgres') {
		return { provider };
	}

	const pocketbaseUrl = source.POCKETBASE_URL;
	if (!pocketbaseUrl) {
		throw new Error('POCKETBASE_URL is required when BACKEND_PROVIDER=pocketbase');
	}

	return {
		provider,
		pocketbaseUrl,
		pocketbaseSuperuserEmail: source.POCKETBASE_SUPERUSER_EMAIL,
		pocketbaseSuperuserPassword: source.POCKETBASE_SUPERUSER_PASSWORD
	};
}
