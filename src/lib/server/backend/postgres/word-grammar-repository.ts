import { and, eq } from 'drizzle-orm';
import { db, schema } from '$lib/server/database/connection';
import type { WordGrammarRepository } from '../types';
import type { WordGrammarAnalysis } from '$lib/types/lyric';
import { mapWordGrammarRow } from './mappers';

export function createPostgresWordGrammarRepository(database: any = db): WordGrammarRepository {
	return {
		async get(word: string, language: string) {
			const rows = await database
				.select()
				.from(schema.wordGrammarAnalysis)
				.where(
					and(
						eq(schema.wordGrammarAnalysis.word, word.toLowerCase()),
						eq(schema.wordGrammarAnalysis.language, language)
					)
				)
				.limit(1);

			return rows[0] ? mapWordGrammarRow(rows[0]) : null;
		},

		async save(analysis: WordGrammarAnalysis) {
			try {
				await database.insert(schema.wordGrammarAnalysis).values({
					word: analysis.word,
					language: analysis.language,
					partOfSpeech: analysis.partOfSpeech,
					grammarRules: analysis.grammarRules ? JSON.stringify(analysis.grammarRules) : null,
					examples: analysis.examples ? JSON.stringify(analysis.examples) : null,
					analysisJson: analysis.analysisJson
				});
			} catch (error) {
				console.error('保存单词语法分析到数据库失败:', error);
			}
		}
	};
}
