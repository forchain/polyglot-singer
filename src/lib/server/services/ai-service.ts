import OpenAI from 'openai';
import type { LyricAnalysis, WordAnalysis, LineAnalysis } from '$lib/types/lyric.js';
import { getAIConfig, validateAIConfig, type AIConfig } from './ai-config.js';
import { restoreLyricAnalysis } from './restoreLyricAnalysis';
import { jsonrepair } from 'jsonrepair';

// Get AI configuration
const aiConfig = getAIConfig();

// Validate configuration
if (!validateAIConfig(aiConfig)) {
	throw new Error('Invalid AI configuration. Please check your environment variables.');
}

// Initialize OpenAI-compatible client
const openai = new OpenAI({
	apiKey: aiConfig.apiKey,
	baseURL: aiConfig.baseURL,
	timeout: aiConfig.timeout
});

/**
 * Analyze lyrics using OpenAI API
 * Provides word-by-word translation and phonetic transcription
 */
export async function analyzeToLyrics(
	lyrics: string,
	sourceLanguage: string = 'en',
	targetLanguage: string = 'zh',
	title?: string,
	artist?: string,
	provider?: string
): Promise<LyricAnalysis> {
	const startTime = Date.now();
	let lastTime = startTime;
	try {
		console.log(`[AI] [0ms] analyzeToLyrics: start, lyricsLength=${lyrics.length}, sourceLanguage=${sourceLanguage}, targetLanguage=${targetLanguage}, title=${title}, artist=${artist}, provider=${provider}`);

		// getAIConfig
		const t0 = Date.now();
		const aiConfig = getAIConfig(provider);

		// OpenAI client 初始化
		const t1 = Date.now();
		const client = new OpenAI({
			apiKey: aiConfig.apiKey,
			baseURL: aiConfig.baseURL,
			timeout: aiConfig.timeout
		});

		// 直接用原始歌词行
		const lines = lyrics.split(/\r?\n/).map(line => line.trim());

		// prompt 生成
		const t3 = Date.now();
		const prompt = createSummaryAndLinesPrompt(lines, sourceLanguage, targetLanguage, title, artist);

		// 发起大模型请求
		const t4 = Date.now();
		const completion = await client.chat.completions.create({
			model: aiConfig.model,
			messages: [
				{
					role: 'system',
					content: 'You are a professional language teacher and linguist. Analyze song lyrics word by word, providing accurate translations and phonetic transcriptions. Focus on the contextual meaning within the song, not dictionary definitions.'
				},
				{
					role: 'user',
					content: prompt
				}
			],
			temperature: aiConfig.temperature,
			max_tokens: aiConfig.maxTokens
		});

		// 收到大模型响应
		const t5 = Date.now();
		const response = completion.choices[0]?.message?.content;
		console.log(`[AI] [${Date.now() - startTime}ms] model response received, length=${response?.length}`);
		console.log('[AI] Model raw response:', response);
		if (!response) throw new Error('No response from AI');

		// JSON 解析
		const t6 = Date.now();
		let parsed;
		try {
			parsed = JSON.parse(response);
		} catch (e) {
			console.error('[AI] JSON parse error (raw):', e, 'response:', response);
			// 使用 jsonrepair 自动修复
			try {
				const repaired = jsonrepair(response);
				console.log('[AI] Try to fix JSON with jsonrepair:', repaired);
				parsed = JSON.parse(repaired);
			} catch (e2) {
				console.error('[AI] JSON parse error (jsonrepair):', e2, 'response:', response);
				throw new Error('Failed to parse AI JSON response (jsonrepair)');
			}
		}

		if (!parsed.lines || !Array.isArray(parsed.lines)) {
			console.error('[AI] parsed.lines is invalid:', parsed.lines);
			throw new Error('AI response missing lines array');
		}

		// 还原 restoreLyricAnalysis
		const t7 = Date.now();
		const restoredLines = restoreLyricAnalysis(lines, parsed.lines);

		// 总耗时
		const totalTime = Date.now() - startTime;
		console.log(`[AI] [${totalTime}ms] analyzeToLyrics finished, total time: ${totalTime}ms`);

		return {
			lines: restoredLines,
			summary: parsed.summary,
			title,
			artist,
			sourceLanguage,
			targetLanguage,
			metadata: {
				processingTime: totalTime,
				model: `${aiConfig.provider}:${aiConfig.model}`,
				timestamp: new Date()
			}
		};
	} catch (error) {
		console.error('[AI] analyzeToLyrics error:', error);
		throw new Error('Failed to analyze lyrics: ' + (error as Error).message);
	}
}


/**
 * Parse AI response into structured format
 */
function parseAIResponse(
	response: string,
	sourceLanguage: string,
	targetLanguage: string
): LyricAnalysis {
	try {
		// Extract JSON from response (in case there's extra text)
		const jsonMatch = response.match(/\{[\s\S]*\}/);
		if (!jsonMatch) {
			throw new Error('No valid JSON found in response');
		}

		const parsed = JSON.parse(jsonMatch[0]);
		
		// Validate and normalize the structure
		if (!parsed.lines || !Array.isArray(parsed.lines)) {
			throw new Error('Invalid response structure: missing lines array');
		}

		const lines: LineAnalysis[] = parsed.lines.map((line: any, index: number) => ({
			originalLine: line.originalLine || '',
			lineNumber: line.lineNumber || index + 1,
			words: (line.words || []).map((word: any, wordIndex: number) => ({
				word: word.word || '',
				phonetic: word.phonetic || '',
				translation: word.translation || '',
				context: word.context || '',
				position: {
					line: line.lineNumber || index + 1,
					index: wordIndex
				},
				confidence: word.confidence || 0.9
			}))
		}));

		return {
			sourceLanguage,
			targetLanguage,
			lines
		};

	} catch (error) {
		console.error('Failed to parse AI response:', error);
		throw new Error('Failed to parse AI analysis response');
	}
}

/**
 * Detect language of lyrics (fallback function)
 */
export async function detectLanguage(text: string): Promise<string> {
	try {
		const completion = await openai.chat.completions.create({
			model: aiConfig.detectionModel || aiConfig.model,
			messages: [
				{
					role: 'system',
					content: 'Detect the language of the given text. Respond with only the 2-letter language code (e.g., "en" for English, "zh" for Chinese, "es" for Spanish).'
				},
				{
					role: 'user',
					content: text.substring(0, 500) // First 500 chars should be enough
				}
			],
			temperature: 0.1,
			max_tokens: 10
		});

		const detected = completion.choices[0]?.message?.content?.trim().toLowerCase();
		return detected || 'en'; // Default to English

	} catch (error) {
		console.error('Language detection error:', error);
		return 'en'; // Default fallback
	}
}


function getUniqueLines(lyrics: string): { uniqueLines: string[], originalLines: string[] } {
	const originalLines = lyrics.split(/\r?\n/).map(line => line.trim());
	const uniqueLines: string[] = [];
	const seen = new Set<string>();
	for (const line of originalLines) {
		if (!seen.has(line)) {
			uniqueLines.push(line);
			seen.add(line);
		}
	}
	return { uniqueLines, originalLines };
}


function mapLang(code: string): string {
	if (code === 'zh') return 'zh-CN';
	if (code === 'yue') return 'zh-HK'; // 粤语
	if (code === 'en') return 'en-US';
	if (code === 'fr') return 'fr-FR';
	if (code === 'es') return 'es-ES';
	if (code === 'de') return 'de-DE';
	if (code === 'ja') return 'ja-JP';
	if (code === 'ko') return 'ko-KR';
	if (code === 'it') return 'it-IT';
	if (code === 'pt') return 'pt-PT';
	if (code === 'ru') return 'ru-RU';
	return code;
}

function createSummaryAndLinesPrompt(
	lines: string[],
	sourceLanguage: string,
	targetLanguage: string,
	title?: string,
	artist?: string
): string {
	const languageNames = {
		en: 'English',
		zh: 'Chinese (Mandarin)',
		yue: 'Cantonese (Yue Chinese)',
		es: 'Spanish',
		fr: 'French',
		de: 'German',
		ja: 'Japanese',
		ko: 'Korean',
		it: 'Italian',
		pt: 'Portuguese',
		ru: 'Russian'
	};

	const sourceLang = languageNames[sourceLanguage as keyof typeof languageNames] || sourceLanguage;
	const targetLang = languageNames[targetLanguage as keyof typeof languageNames] || targetLanguage;

	return `Analyze the following ${sourceLang} song lyric lines word by word.

Instructions:
- First, output a summary of the song in ${targetLang}, explaining the overall meaning, theme, and emotional context.
- Then, for each line, output:
  [
    "lineTranslation",
    [
      ["word1", "phonetic1", "translation1"],
      ...
    ]
  ]
- Return a JSON object with this exact structure:
{
  "summary": "xxx",
  "lines": [ ... ]
}
- Do NOT include any field names in lines, only use arrays.
- All translations and phonetics must be in ${targetLang}.

Example input:
hello world
foo bar
hello world

Example output:
{
  "summary": "这是一首关于问候的歌曲",
  "lines": [
    [
      "你好，世界",
      [
        ["hello", "/həˈloʊ/", "你好"],
        ["world", "/wɜːrld/", "世界"]
      ]
    ],
    [
      "示例翻译",
      [
        ["foo", "/fuː/", "示例"],
        ["bar", "/bɑːr/", "条"]
      ]
    ],
    [
      "你好，世界",
      [
        ["hello", "/həˈloʊ/", "你好"],
        ["world", "/wɜːrld/", "世界"]
      ]
    ]
  ]
}

Lyric lines to analyze:
${lines.join('\n')}

IMPORTANT: Return ONLY the JSON object, no extra text or explanation.`;
} 