import { describe, expect, it } from 'vitest';
import { getBackendProviderName } from '../index';

describe('backend factory', () => {
	it('selects postgres by default', () => {
		expect(getBackendProviderName({})).toBe('postgres');
	});

	it('selects pocketbase from env', () => {
		expect(
			getBackendProviderName({
				BACKEND_PROVIDER: 'pocketbase',
				POCKETBASE_URL: 'http://127.0.0.1:8090'
			})
		).toBe('pocketbase');
	});
});
