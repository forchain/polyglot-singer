import type { AppUser } from '$lib/types/auth';
import type { AnalysisRecord } from '../types';
import { normalizePreferences, toJsonString } from '../json';

function escapeFilterValue(value: string): string {
	return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

export function mapPocketBaseAuthRecord(record: any): AppUser | null {
	if (!record?.id) {
		return null;
	}

	return {
		id: record.id,
		email: record.email,
		username: record.username ?? record.email,
		displayName: record.displayName ?? record.name ?? null,
		createdAt: record.created
	};
}

export function mapPocketBaseAnalysisRecord(record: any): AnalysisRecord {
	return {
		id: record.id,
		userId: record.user ?? null,
		title: record.title ?? null,
		artist: record.artist ?? null,
		lyrics: record.lyrics,
		sourceLanguage: record.sourceLanguage,
		targetLanguage: record.targetLanguage,
		analysisJson: toJsonString(record.analysisJson) ?? '{}',
		isPublic: record.isPublic ?? false,
		createdAt: record.created ?? null,
		voice: record.voice ?? null
	};
}

export function mapPocketBasePreferencesRecord(record: any): Record<string, unknown> {
	return normalizePreferences({
		...record,
		userId: record.user
	});
}

export function buildAccessibleAnalysisFilter(id: string, userId?: string | null): string {
	const escapedId = escapeFilterValue(id);
	if (!userId) {
		return `id = "${escapedId}" && isPublic = true`;
	}

	return `id = "${escapedId}" && (isPublic = true || user = "${escapeFilterValue(userId)}")`;
}

export function buildPublicGalleryFilter(): string {
	return 'isPublic = true';
}

export function buildOwnerFilter(id: string, userId: string): string {
	return `id = "${escapeFilterValue(id)}" && user = "${escapeFilterValue(userId)}"`;
}

export function buildWordGrammarFilter(word: string, language: string): string {
	return `word = "${escapeFilterValue(word.toLowerCase())}" && language = "${escapeFilterValue(language)}"`;
}
