import { db } from '../database/connection';
import { wordGrammarAnalysis } from '../database/schema';
import { eq, and } from 'drizzle-orm';
import type { WordGrammarAnalysis, GrammarRule } from '$lib/types/lyric';
import { analyzeWordGrammar } from './ai-service';

// 内存缓存
const wordCache = new Map<string, WordGrammarAnalysis>();

export class WordGrammarService {
	/**
	 * 分析单词语法，优先使用缓存，然后是数据库，最后调用AI
	 */
	static async analyzeWord(word: string, language: string): Promise<WordGrammarAnalysis> {
		const cacheKey = `${word.toLowerCase()}_${language}`;
		
		// 1. 检查内存缓存
		if (wordCache.has(cacheKey)) {
			console.log(`从内存缓存获取单词语法分析: ${word}`);
			return wordCache.get(cacheKey)!;
		}
		
		// 2. 检查数据库
		const dbResult = await this.getFromDatabase(word, language);
		if (dbResult) {
			console.log(`从数据库获取单词语法分析: ${word}`);
			// 缓存到内存
			wordCache.set(cacheKey, dbResult);
			return dbResult;
		}
		
		// 3. 调用AI分析
		console.log(`调用AI分析单词语法: ${word}`);
		const aiResult = await this.analyzeWithAI(word, language);
		
		// 4. 保存到数据库
		await this.saveToDatabase(aiResult);
		
		// 5. 缓存到内存
		wordCache.set(cacheKey, aiResult);
		
		return aiResult;
	}
	
	/**
	 * 从数据库获取单词语法分析
	 */
	private static async getFromDatabase(word: string, language: string): Promise<WordGrammarAnalysis | null> {
		try {
			const result = await db
				.select()
				.from(wordGrammarAnalysis)
				.where(
					and(
						eq(wordGrammarAnalysis.word, word.toLowerCase()),
						eq(wordGrammarAnalysis.language, language)
					)
				)
				.limit(1);
			
			if (result.length === 0) {
				return null;
			}
			
			const dbRecord = result[0];
			return {
				id: dbRecord.id,
				word: dbRecord.word,
				language: dbRecord.language,
				partOfSpeech: dbRecord.partOfSpeech || undefined,
				grammarRules: dbRecord.grammarRules ? JSON.parse(dbRecord.grammarRules) : undefined,
				examples: dbRecord.examples ? JSON.parse(dbRecord.examples) : undefined,
				analysisJson: dbRecord.analysisJson,
				createdAt: dbRecord.createdAt,
				updatedAt: dbRecord.updatedAt
			};
		} catch (error) {
			console.error('从数据库获取单词语法分析失败:', error);
			return null;
		}
	}
	
	/**
	 * 使用AI分析单词语法
	 */
	private static async analyzeWithAI(word: string, language: string): Promise<WordGrammarAnalysis> {
		try {
			const aiAnalysis = await analyzeWordGrammar(word, language);
			
			return {
				word: word.toLowerCase(),
				language,
				partOfSpeech: aiAnalysis.partOfSpeech,
				grammarRules: aiAnalysis.grammarRules,
				examples: aiAnalysis.examples,
				analysisJson: JSON.stringify(aiAnalysis)
			};
		} catch (error) {
			console.error('AI分析单词语法失败:', error);
			// 返回基础分析结果
			return {
				word: word.toLowerCase(),
				language,
				analysisJson: JSON.stringify({
					word,
					language,
					error: '分析失败'
				})
			};
		}
	}
	
	/**
	 * 保存分析结果到数据库
	 */
	private static async saveToDatabase(analysis: WordGrammarAnalysis): Promise<void> {
		try {
			await db.insert(wordGrammarAnalysis).values({
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
	
	/**
	 * 清除内存缓存
	 */
	static clearCache(): void {
		wordCache.clear();
	}
	
	/**
	 * 获取缓存统计信息
	 */
	static getCacheStats(): { size: number; keys: string[] } {
		return {
			size: wordCache.size,
			keys: Array.from(wordCache.keys())
		};
	}
} 