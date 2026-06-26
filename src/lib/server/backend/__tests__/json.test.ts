import { describe, expect, it } from 'vitest';
import { parseJsonField, toJsonString, normalizePreferences } from '../json';

describe('backend JSON helpers', () => {
	it('parses Postgres text JSON fields', () => {
		expect(parseJsonField<{ voice: string }>('{"voice":"alloy"}')).toEqual({ voice: 'alloy' });
	});

	it('accepts PocketBase object JSON fields', () => {
		expect(parseJsonField<{ voice: string }>({ voice: 'nova' })).toEqual({ voice: 'nova' });
	});

	it('returns fallback for null and malformed optional fields', () => {
		expect(parseJsonField(null, [])).toEqual([]);
		expect(parseJsonField('not-json', { ok: false })).toEqual({ ok: false });
	});

	it('serializes cache fields without throwing on null or undefined', () => {
		expect(toJsonString(null)).toBeNull();
		expect(toJsonString(undefined)).toBeNull();
		expect(toJsonString([{ rule: 'noun' }])).toBe('[{"rule":"noun"}]');
	});

	it('keeps defaultVoices string-compatible for existing UI consumers', () => {
		const preferences = normalizePreferences({
			id: 'pref1',
			userId: 'user1',
			defaultVoices: { en: 'alloy', zh: 'nova' }
		});

		expect(preferences.defaultVoices).toBe('{"en":"alloy","zh":"nova"}');
	});
});
