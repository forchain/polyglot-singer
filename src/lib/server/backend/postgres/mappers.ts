import type { AppUser } from '$lib/types/auth';
import type { AnalysisRecord } from '../types';
import type { WordGrammarAnalysis } from '$lib/types/lyric';
import { normalizePreferences, parseJsonField } from '../json';

export function mapSupabaseUser(user: any): AppUser | null {
	if (!user?.id) {
		return null;
	}

	return {
		id: user.id,
		email: user.email,
		username: user.user_metadata?.username ?? user.email,
		displayName: user.user_metadata?.display_name ?? user.user_metadata?.displayName ?? null,
		createdAt: user.created_at
	};
}

export function mapAnalyzedLyricRow(row: any): AnalysisRecord {
	return {
		id: row.id,
		userId: row.userId ?? row.user_id ?? null,
		title: row.title ?? null,
		artist: row.artist ?? null,
		lyrics: row.lyrics,
		sourceLanguage: row.sourceLanguage ?? row.source_language,
		targetLanguage: row.targetLanguage ?? row.target_language,
		analysisJson: row.analysisJson ?? row.analysis_json,
		isPublic: row.isPublic ?? row.is_public ?? false,
		createdAt: row.createdAt ?? row.created_at ?? null,
		voice: row.voice ?? null
	};
}

export function mapUserPreferencesRow(row: any): Record<string, unknown> {
	return normalizePreferences(row);
}

export function mapWordGrammarRow(row: any): WordGrammarAnalysis {
	return {
		id: row.id,
		word: row.word,
		language: row.language,
		partOfSpeech: row.partOfSpeech ?? row.part_of_speech ?? undefined,
		grammarRules: parseJsonField(row.grammarRules ?? row.grammar_rules, undefined) ?? undefined,
		examples: parseJsonField(row.examples, undefined) ?? undefined,
		analysisJson:
			typeof row.analysisJson === 'string'
				? row.analysisJson
				: typeof row.analysis_json === 'string'
					? row.analysis_json
					: JSON.stringify(row.analysisJson ?? row.analysis_json ?? {}),
		createdAt: row.createdAt ?? row.created_at,
		updatedAt: row.updatedAt ?? row.updated_at
	};
}
