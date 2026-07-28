import { describe, expect, it, vi } from 'vitest';
import {
	buildAccessibleAnalysisFilter,
	buildPublicGalleryFilter,
	mapPocketBaseAnalysisRecord,
	mapPocketBaseAuthRecord,
	mapPocketBasePreferencesRecord
} from '../mappers';
import { mapPocketBaseError } from '../errors';
import { createPocketBaseWordGrammarRepository } from '../word-grammar-repository';

describe('pocketbase backend mappers', () => {
	it('maps auth records to AppUser', () => {
		expect(
			mapPocketBaseAuthRecord({
				id: 'user1',
				email: 'a@example.com',
				username: 'alice',
				displayName: 'Alice',
				created: '2026-06-26 00:00:00.000Z'
			})
		).toEqual({
			id: 'user1',
			email: 'a@example.com',
			username: 'alice',
			displayName: 'Alice',
			createdAt: '2026-06-26 00:00:00.000Z'
		});
	});

	it('maps analyzed lyrics records to existing API shape', () => {
		expect(
			mapPocketBaseAnalysisRecord({
				id: 'analysis1',
				user: 'user1',
				title: 'Song',
				artist: 'Artist',
				lyrics: 'hello',
				sourceLanguage: 'en',
				targetLanguage: 'zh',
				analysisJson: { lines: [] },
				voice: 'alloy',
				isPublic: true,
				created: '2026-06-26 00:00:00.000Z'
			})
		).toMatchObject({
			id: 'analysis1',
			userId: 'user1',
			analysisJson: '{"lines":[]}',
			voice: 'alloy',
			isPublic: true
		});
	});

	it('builds public/private filters', () => {
		expect(buildAccessibleAnalysisFilter('analysis1', 'user1')).toBe(
			'id = "analysis1" && (isPublic = true || user = "user1")'
		);
		expect(buildAccessibleAnalysisFilter('analysis1', null)).toBe(
			'id = "analysis1" && isPublic = true'
		);
		expect(buildPublicGalleryFilter()).toBe('isPublic = true');
	});

	it('keeps defaultVoices string-compatible in preference responses', () => {
		expect(
			mapPocketBasePreferencesRecord({
				id: 'pref1',
				user: 'user1',
				defaultVoices: { en: 'alloy' }
			})
		).toMatchObject({
			userId: 'user1',
			defaultVoices: '{"en":"alloy"}'
		});
	});
});

describe('pocketbase error mapping', () => {
	it('maps known provider errors to project-level status codes', () => {
		expect(mapPocketBaseError({ status: 400 }).status).toBe(400);
		expect(mapPocketBaseError({ status: 401 }).status).toBe(401);
		expect(mapPocketBaseError({ status: 404 }).status).toBe(404);
		expect(mapPocketBaseError(new TypeError('fetch failed')).status).toBe(503);
		expect(mapPocketBaseError(new Error('boom')).status).toBe(500);
	});
});

describe('pocketbase word grammar repository', () => {
	it('does not throw when cache persistence fails', async () => {
		const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
		const repository = createPocketBaseWordGrammarRepository({
			publicClient: {
				collection: vi.fn()
			} as any,
			getSuperuserClient: async () => {
				throw new Error('missing credentials');
			}
		});

		await expect(
			repository.save({
				word: 'hello',
				language: 'en',
				analysisJson: '{}'
			})
		).resolves.toBeUndefined();
		expect(consoleError).toHaveBeenCalled();
		consoleError.mockRestore();
	});
});
