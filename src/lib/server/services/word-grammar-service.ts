import type { WordGrammarAnalysis, GrammarRule } from '$lib/types/lyric';
import { analyzeWordGrammar } from './ai-service';
import type { WordGrammarRepository } from '$lib/server/backend/types';
import { getBackendRepositories } from '$lib/server/backend';

// 内存缓存
const wordCache = new Map<string, WordGrammarAnalysis>();

export class WordGrammarService {
	private static repositoryOverride: WordGrammarRepository | null = null;

	static setRepositoryForTesting(repository: WordGrammarRepository | null): void {
		this.repositoryOverride = repository;
	}

	private static async getRepository(): Promise<WordGrammarRepository> {
		if (this.repositoryOverride) {
			return this.repositoryOverride;
		}

		return (await getBackendRepositories()).wordGrammar;
	}

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
			return await (await this.getRepository()).get(word, language);
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
			await (await this.getRepository()).save(analysis);
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
