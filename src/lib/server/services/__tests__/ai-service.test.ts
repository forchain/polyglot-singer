import { describe, it, expect, vi, beforeEach } from 'vitest';
import { analyzeToLyrics, detectLanguage } from '../ai-service.js';
import { getAIConfig } from '../ai-config.js';

// Mock OpenAI
vi.mock('openai', () => ({
	default: vi.fn().mockImplementation(() => ({
		chat: {
			completions: {
				create: vi.fn()
					.mockResolvedValueOnce({
						choices: [{
							message: {
								content: JSON.stringify({
									overallTranslation: "你好世界",
									summary: "这是一首关于问候的歌曲"
								})
							}
						}]
					})
					.mockResolvedValueOnce({
						choices: [{
							message: {
								content: JSON.stringify({
									lines: [{
										originalLine: "Hello world",
										lineNumber: 1,
										lineTranslation: "你好世界",
										words: [{
											word: "Hello",
											phonetic: "/həˈloʊ/",
											translation: "你好",
											context: "greeting",
											position: { line: 1, index: 0 }
										}, {
											word: "world",
											phonetic: "/wɜːrld/",
											translation: "世界",
											context: "noun",
											position: { line: 1, index: 1 }
										}]
									}]
								})
							}
						}]
					})
					.mockResolvedValueOnce({
						choices: [{
							message: {
								content: "en"
							}
						}]
					})
			}
		}
	}))
}));

describe('AI Service', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('analyzeToLyrics', () => {
		it('should analyze lyrics with DeepSeek provider including summary and translation', async () => {
			const result = await analyzeToLyrics(
				'Hello world',
				'en',
				'zh',
				'Test Song',
				'Test Artist',
				'deepseek'
			);

			expect(result).toBeDefined();
			expect(result.sourceLanguage).toBe('en');
			expect(result.targetLanguage).toBe('zh');
			expect(result.summary).toBe('这是一首关于问候的歌曲');
			expect(result.overallTranslation).toBe('你好世界');
			expect(result.lines).toHaveLength(1);
			expect(result.lines[0].lineTranslation).toBe('你好世界');
			expect(result.lines[0].words).toHaveLength(2);
		});

		it('should analyze lyrics with OpenAI provider', async () => {
			const result = await analyzeToLyrics(
				'Hello world',
				'en',
				'zh',
				'Test Song',
				'Test Artist',
				'openai'
			);

			expect(result).toBeDefined();
			expect(result.sourceLanguage).toBe('en');
			expect(result.targetLanguage).toBe('zh');
			expect(result.summary).toBeDefined();
			expect(result.overallTranslation).toBeDefined();
			expect(result.lines).toHaveLength(1);
		});

		it('should analyze lyrics with Claude provider', async () => {
			const result = await analyzeToLyrics(
				'Hello world',
				'en',
				'zh',
				'Test Song',
				'Test Artist',
				'anthropic'
			);

			expect(result).toBeDefined();
			expect(result.metadata?.model).toContain('anthropic');
			expect(result.summary).toBeDefined();
			expect(result.overallTranslation).toBeDefined();
		});

		it('should analyze lyrics with local provider', async () => {
			const result = await analyzeToLyrics(
				'Hello world',
				'en',
				'zh',
				'Test Song',
				'Test Artist',
				'local'
			);

			expect(result).toBeDefined();
			expect(result.metadata?.model).toContain('local');
			expect(result.summary).toBeDefined();
			expect(result.overallTranslation).toBeDefined();
		});

		it('should include title and artist in result', async () => {
			const result = await analyzeToLyrics(
				'Hello world',
				'en',
				'zh',
				'Test Song',
				'Test Artist',
				'deepseek'
			);

			expect(result.title).toBe('Test Song');
			expect(result.artist).toBe('Test Artist');
		});
	});

	describe('detectLanguage', () => {
		it('should detect language correctly', async () => {
			const result = await detectLanguage('Hello world');
			expect(result).toBe('en');
		});
	});
});

describe('AI Config', () => {
	it('should get Doubao config by default', () => {
		const config = getAIConfig();
		expect(config.provider).toBe('doubao');
		expect(config.baseURL).toBe('https://ark.cn-beijing.volces.com/api/v3');
	});

	it('should get Doubao config explicitly', () => {
		const config = getAIConfig('doubao');
		expect(config.provider).toBe('doubao');
		expect(config.baseURL).toBe('https://ark.cn-beijing.volces.com/api/v3');
	});

	it('should get DeepSeek config explicitly', () => {
		const config = getAIConfig('deepseek');
		expect(config.provider).toBe('deepseek');
		expect(config.baseURL).toBe('https://api.deepseek.com/v1');
	});

	it('should get OpenAI config', () => {
		const config = getAIConfig('openai');
		expect(config.provider).toBe('openai');
		expect(config.baseURL).toBe('https://api.openai.com/v1');
	});

	it('should get Anthropic config', () => {
		const config = getAIConfig('anthropic');
		expect(config.provider).toBe('anthropic');
		expect(config.baseURL).toBe('https://api.anthropic.com');
	});

	it('should get Google config', () => {
		const config = getAIConfig('google');
		expect(config.provider).toBe('google');
		expect(config.baseURL).toBe('https://generativelanguage.googleapis.com');
	});

	it('should get local config', () => {
		const config = getAIConfig('local');
		expect(config.provider).toBe('local');
		expect(config.baseURL).toBe('http://localhost:11434/v1');
	});
}); 