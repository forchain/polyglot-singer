import { describe, expect, it } from 'vitest';
import {
	mapAnalyzedLyricRow,
	mapSupabaseUser,
	mapUserPreferencesRow,
	mapWordGrammarRow
} from '../mappers';

describe('postgres backend mappers', () => {
	it('maps Supabase users to AppUser', () => {
		expect(
			mapSupabaseUser({
				id: 'user1',
				email: 'a@example.com',
				user_metadata: { username: 'alice', display_name: 'Alice' },
				created_at: '2026-06-26T00:00:00.000Z'
			})
		).toEqual({
			id: 'user1',
			email: 'a@example.com',
			username: 'alice',
			displayName: 'Alice',
			createdAt: '2026-06-26T00:00:00.000Z'
		});
	});

	it('maps analyzed lyrics rows to repository records', () => {
		const row = mapAnalyzedLyricRow({
			id: 'analysis1',
			userId: 'user1',
			title: 'Song',
			artist: 'Artist',
			lyrics: 'hello',
			sourceLanguage: 'en',
			targetLanguage: 'zh',
			analysisJson: '{"lines":[]}',
			isPublic: true,
			voice: 'alloy',
			createdAt: new Date('2026-06-26T00:00:00.000Z')
		});

		expect(row).toMatchObject({
			id: 'analysis1',
			userId: 'user1',
			title: 'Song',
			artist: 'Artist',
			analysisJson: '{"lines":[]}',
			isPublic: true,
			voice: 'alloy'
		});
	});

	it('parses word grammar JSON fields', () => {
		expect(
			mapWordGrammarRow({
				id: 'grammar1',
				word: 'hello',
				language: 'en',
				partOfSpeech: 'interjection',
				grammarRules: '[{"rule":"greeting"}]',
				examples: '["hello world"]',
				analysisJson: '{"word":"hello"}',
				createdAt: new Date('2026-06-26T00:00:00.000Z'),
				updatedAt: new Date('2026-06-26T00:00:00.000Z')
			})
		).toMatchObject({
			word: 'hello',
			grammarRules: [{ rule: 'greeting' }],
			examples: ['hello world']
		});
	});

	it('keeps defaultVoices string-compatible in preference responses', () => {
		expect(
			mapUserPreferencesRow({
				id: 'pref1',
				userId: 'user1',
				defaultVoices: { en: 'alloy' }
			})
		).toMatchObject({
			defaultVoices: '{"en":"alloy"}'
		});
	});
});
