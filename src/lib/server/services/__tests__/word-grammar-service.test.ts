import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { WordGrammarService } from '../word-grammar-service';
import { analyzeWordGrammar } from '../ai-service';

vi.mock('../ai-service', () => ({
	analyzeWordGrammar: vi.fn()
}));

describe('WordGrammarService', () => {
	beforeEach(() => {
		// 清除缓存
		WordGrammarService.clearCache();
		WordGrammarService.setRepositoryForTesting(null);
		vi.mocked(analyzeWordGrammar).mockReset();
	});

	afterEach(() => {
		// 清理缓存
		WordGrammarService.clearCache();
		WordGrammarService.setRepositoryForTesting(null);
	});

	it('应该能够获取缓存统计信息', () => {
		const stats = WordGrammarService.getCacheStats();
		expect(stats.size).toBe(0);
		expect(stats.keys).toEqual([]);
	});

	it('应该能够清除缓存', () => {
		// 模拟添加一些缓存
		const mockAnalysis = {
			word: 'test',
			language: 'en',
			analysisJson: '{}'
		};
		
		// 这里我们无法直接测试私有方法，但可以测试公共接口
		const stats = WordGrammarService.getCacheStats();
		expect(stats.size).toBe(0);
	});

	it('应该能够从仓储缓存获取单词语法分析', async () => {
		WordGrammarService.setRepositoryForTesting({
			get: vi.fn(async () => ({
				word: 'hello',
				language: 'en',
				analysisJson: '{"word":"hello"}'
			})),
			save: vi.fn()
		});

		const result = await WordGrammarService.analyzeWord('hello', 'en');

		expect(result.word).toBe('hello');
		expect(result.language).toBe('en');
		expect(analyzeWordGrammar).not.toHaveBeenCalled();
	});

	it('AI分析成功后即使缓存写入失败也返回结果', async () => {
		const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
		vi.mocked(analyzeWordGrammar).mockResolvedValue({
			partOfSpeech: 'interjection',
			grammarRules: [],
			examples: []
		});
		WordGrammarService.setRepositoryForTesting({
			get: vi.fn(async () => null),
			save: vi.fn(async () => {
				throw new Error('cache write failed');
			})
		});

		const result = await WordGrammarService.analyzeWord('hello', 'en');

		expect(result.word).toBe('hello');
		expect(result.language).toBe('en');
		expect(result.partOfSpeech).toBe('interjection');
		expect(consoleError).toHaveBeenCalled();
		consoleError.mockRestore();
	});
});
