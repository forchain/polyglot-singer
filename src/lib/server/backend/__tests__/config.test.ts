import { describe, expect, it } from 'vitest';
import { getBackendConfig } from '../config';

describe('backend config', () => {
	it('defaults to postgres provider', () => {
		const config = getBackendConfig({});

		expect(config.provider).toBe('postgres');
	});

	it('requires PocketBase URL for pocketbase provider', () => {
		expect(() => getBackendConfig({ BACKEND_PROVIDER: 'pocketbase' })).toThrow(
			'POCKETBASE_URL is required'
		);
	});

	it('accepts PocketBase URL and superuser credentials', () => {
		const config = getBackendConfig({
			BACKEND_PROVIDER: 'pocketbase',
			POCKETBASE_URL: 'http://127.0.0.1:8090',
			POCKETBASE_SUPERUSER_EMAIL: 'admin@example.com',
			POCKETBASE_SUPERUSER_PASSWORD: 'secret'
		});

		expect(config).toEqual({
			provider: 'pocketbase',
			pocketbaseUrl: 'http://127.0.0.1:8090',
			pocketbaseSuperuserEmail: 'admin@example.com',
			pocketbaseSuperuserPassword: 'secret'
		});
	});

	it('rejects unsupported providers', () => {
		expect(() => getBackendConfig({ BACKEND_PROVIDER: 'firebase' })).toThrow(
			'Unsupported BACKEND_PROVIDER'
		);
	});
});
