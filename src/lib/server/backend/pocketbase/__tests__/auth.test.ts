import { describe, expect, it, vi } from 'vitest';
import { refreshPocketBaseAuth } from '../auth';

describe('PocketBase auth helpers', () => {
	it('clears stale auth when refresh fails', async () => {
		const clear = vi.fn();
		const client = {
			authStore: {
				isValid: true,
				record: { collectionName: 'users' },
				clear
			},
			collection: vi.fn(() => ({
				authRefresh: vi.fn(async () => {
					throw new Error('expired');
				})
			}))
		};

		const user = await refreshPocketBaseAuth(client as any);

		expect(user).toBeNull();
		expect(clear).toHaveBeenCalled();
	});
});
