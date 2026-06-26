import type { WordGrammarAnalysis } from '$lib/types/lyric';
import type { WordGrammarRepository } from '../types';
import type { PocketBaseClientBundle } from './client';
import { parseJsonField } from '../json';
import { buildWordGrammarFilter } from './mappers';

function mapWordGrammarRecord(record: any): WordGrammarAnalysis {
	return {
		id: record.id,
		word: record.word,
		language: record.language,
		partOfSpeech: record.partOfSpeech || undefined,
		grammarRules: parseJsonField(record.grammarRules, undefined) ?? undefined,
		examples: parseJsonField(record.examples, undefined) ?? undefined,
		analysisJson:
			typeof record.analysisJson === 'string'
				? record.analysisJson
				: JSON.stringify(record.analysisJson ?? {}),
		createdAt: record.created,
		updatedAt: record.updated
	};
}

export function createPocketBaseWordGrammarRepository(
	bundle: Pick<PocketBaseClientBundle, 'publicClient' | 'getSuperuserClient'>
): WordGrammarRepository {
	return {
		async get(word: string, language: string) {
			try {
				const record = await bundle.publicClient
					.collection('word_grammar_analysis')
					.getFirstListItem(buildWordGrammarFilter(word, language));
				return mapWordGrammarRecord(record);
			} catch (error: any) {
				if (error?.status === 404) {
					return null;
				}
				throw error;
			}
		},

		async save(analysis: WordGrammarAnalysis) {
			try {
				const client = await bundle.getSuperuserClient();
				const records = client.collection('word_grammar_analysis');
				const payload = {
					word: analysis.word.toLowerCase(),
					language: analysis.language,
					partOfSpeech: analysis.partOfSpeech || '',
					grammarRules: analysis.grammarRules || null,
					examples: analysis.examples || null,
					analysisJson: parseJsonField(analysis.analysisJson, {}) ?? {}
				};

				try {
					const existing = await records.getFirstListItem(
						buildWordGrammarFilter(analysis.word, analysis.language)
					);
					await records.update(existing.id, payload);
				} catch (error: any) {
					if (error?.status !== 404) {
						throw error;
					}
					await records.create(payload);
				}
			} catch (error) {
				console.error('保存单词语法分析到 PocketBase 失败:', error);
			}
		}
	};
}
