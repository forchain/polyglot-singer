import OpenAI from 'openai';
import type { LyricAnalysis, WordAnalysis, LineAnalysis } from '$lib/types/lyric.js';
import { getAIConfig, validateAIConfig, type AIConfig } from './ai-config.js';

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
	console.log('[AI] analyzeToLyrics: start', { lyricsLength: lyrics.length, sourceLanguage, targetLanguage, title, artist, provider });

	try {
		console.log(`[AI] [${Date.now() - startTime}ms] Getting AI config...`);
		const aiConfig = getAIConfig(provider);
		console.log(`[AI] [${Date.now() - startTime}ms] Got AI config:`, aiConfig);

		console.log(`[AI] [${Date.now() - startTime}ms] Initializing OpenAI client...`);
		const client = new OpenAI({
			apiKey: aiConfig.apiKey,
			baseURL: aiConfig.baseURL,
			timeout: aiConfig.timeout
		});
		console.log(`[AI] [${Date.now() - startTime}ms] OpenAI client initialized.`);

		// 第一步：生成整体翻译和总结
		console.log(`[AI] [${Date.now() - startTime}ms] Step 1: Creating overall translation and summary...`);
		const overallPrompt = createOverallAnalysisPrompt(lyrics, sourceLanguage, targetLanguage, title, artist);
		console.log(`[AI] [${Date.now() - startTime}ms] Overall prompt created. Length: ${overallPrompt.length}`);

		console.log(`[AI] [${Date.now() - startTime}ms] Sending overall analysis request...`);
		const overallCompletion = await client.chat.completions.create({
			model: aiConfig.model,
			messages: [
				{
					role: 'system',
					content: 'You are a professional language teacher and music analyst. First provide an overall translation and summary of the song lyrics to help understand the context and meaning.'
				},
				{
					role: 'user',
					content: overallPrompt
				}
			],
			temperature: aiConfig.temperature,
			max_tokens: aiConfig.maxTokens
		});

		const overallResponse = overallCompletion.choices[0]?.message?.content;
		if (!overallResponse) {
			throw new Error('No response from OpenAI API for overall analysis');
		}

		console.log(`[AI] [${Date.now() - startTime}ms] Parsing overall analysis...`);
		const overallAnalysis = parseOverallAnalysis(overallResponse);

		// 第二步：逐行分析
		console.log(`[AI] [${Date.now() - startTime}ms] Step 2: Creating detailed line-by-line analysis...`);
		const detailedPrompt = createDetailedAnalysisPrompt(lyrics, sourceLanguage, targetLanguage, overallAnalysis);
		console.log(`[AI] [${Date.now() - startTime}ms] Detailed prompt created. Length: ${detailedPrompt.length}`);

		console.log(`[AI] [${Date.now() - startTime}ms] Sending detailed analysis request...`);
		const detailedCompletion = await client.chat.completions.create({
			model: aiConfig.model,
			messages: [
				{
					role: 'system',
					content: 'You are a professional language teacher and linguist. Analyze song lyrics word by word, providing accurate translations and phonetic transcriptions. Focus on the contextual meaning within the song, not dictionary definitions.'
				},
				{
					role: 'user',
					content: detailedPrompt
				}
			],
			temperature: aiConfig.temperature,
			max_tokens: aiConfig.maxTokens
		});

		const detailedResponse = detailedCompletion.choices[0]?.message?.content;
		if (!detailedResponse) {
			throw new Error('No response from OpenAI API for detailed analysis');
		}

		console.log(`[AI] [${Date.now() - startTime}ms] Parsing detailed analysis...`);
		const detailedAnalysis = parseDetailedAnalysis(detailedResponse, sourceLanguage, targetLanguage);

		// 合并结果
		const analysis: LyricAnalysis = {
			...detailedAnalysis,
			summary: overallAnalysis.summary,
			overallTranslation: overallAnalysis.overallTranslation,
			title,
			artist,
			metadata: {
				processingTime: Date.now() - startTime,
				model: `${aiConfig.provider}:${aiConfig.model}`,
				timestamp: new Date()
			}
		};

		console.log(`[AI] [${Date.now() - startTime}ms] Returning combined analysis result.`);
		return analysis;

	} catch (error) {
		console.error(`[AI] [${Date.now() - startTime}ms] AI service error:`, error);
		throw new Error('Failed to analyze lyrics: ' + (error as Error).message);
	}
}

/**
 * Create analysis prompt for OpenAI
 */
function createAnalysisPrompt(
	lyrics: string,
	sourceLanguage: string,
	targetLanguage: string
): string {
	const languageNames = {
		en: 'English',
		zh: 'Chinese (Mandarin)',
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

	return `Analyze the following ${sourceLang} song lyrics word by word. For each word, provide:
1. The original word
2. Phonetic transcription (IPA format when possible)
3. Translation to ${targetLang} (contextual meaning in the song, not dictionary definition)
4. Brief context explanation if needed

Format your response as JSON with this exact structure:
{
  "lines": [
    {
      "originalLine": "exact line text",
      "lineNumber": 1,
      "words": [
        {
          "word": "original_word",
          "phonetic": "/phonetic_transcription/",
          "translation": "contextual_translation",
          "context": "brief_explanation_if_needed",
          "position": {"line": 1, "index": 0}
        }
      ]
    }
  ]
}

Song lyrics to analyze:
${lyrics}

Important notes:
- Maintain exact spacing and punctuation
- For ${targetLang === 'Chinese (Mandarin)' ? 'Chinese, include pinyin in phonetic field' : 'phonetic transcriptions, use IPA when possible'}
- Focus on how words are used in this song context
- If a word has multiple meanings, choose the one that fits the song
- Handle contractions as separate words (e.g., "don't" = "do" + "not")`;
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

/**
 * Create overall analysis prompt for generating summary and translation
 */
function createOverallAnalysisPrompt(
	lyrics: string,
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

	const songInfo = title && artist ? `Song: "${title}" by ${artist}` : '';

	return `Please provide an overall analysis of the following ${sourceLang} song lyrics.

${songInfo}

Song lyrics:
${lyrics}

Instructions:
1. Output the complete translation of the entire lyrics in ${targetLang}.
2. Output a comprehensive summary in ${targetLang}, explaining the overall meaning, theme, and emotional context of the song.

Format your response as JSON with this exact structure:
{
  "overallTranslation": "complete translation of the entire lyrics in ${targetLang}",
  "summary": "comprehensive summary in ${targetLang} explaining the meaning, theme, and emotional context"
}

Important notes:
- The overall translation should maintain the poetic and emotional quality of the original, and must be in ${targetLang}.
- The summary must be written in ${targetLang}.
- Focus on the overall message and feeling of the song, not individual words.`;
}

/**
 * Parse overall analysis response
 */
function parseOverallAnalysis(response: string): { overallTranslation: string; summary: string } {
	try {
		// Extract JSON from response
		const jsonMatch = response.match(/\{[\s\S]*\}/);
		if (!jsonMatch) {
			throw new Error('No valid JSON found in overall analysis response');
		}

		const parsed = JSON.parse(jsonMatch[0]);
		
		return {
			overallTranslation: parsed.overallTranslation || '',
			summary: parsed.summary || ''
		};

	} catch (error) {
		console.error('Failed to parse overall analysis response:', error);
		throw new Error('Failed to parse overall analysis response');
	}
}

/**
 * Create detailed analysis prompt for word-by-word analysis
 */
function createDetailedAnalysisPrompt(
	lyrics: string,
	sourceLanguage: string,
	targetLanguage: string,
	overallAnalysis: { overallTranslation: string; summary: string }
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

	return `Now analyze the following ${sourceLang} song lyrics word by word.

Context from overall analysis:
- Overall meaning: ${overallAnalysis.summary}
- Overall translation: ${overallAnalysis.overallTranslation}

Instructions:
- For each word, provide:
  1. The original word
  2. Phonetic transcription (IPA format when possible)
  3. Translation to ${targetLang} (contextual meaning in the song, not dictionary definition)
  4. Brief context explanation if needed
- For each line, also provide:
  5. A complete translation of the entire line in ${targetLang}

Format your response as JSON with this exact structure:
{
  "lines": [
    {
      "originalLine": "exact line text",
      "lineNumber": 1,
      "lineTranslation": "complete translation of this line in ${targetLang}",
      "words": [
        {
          "word": "original_word",
          "phonetic": "/phonetic_transcription/",
          "translation": "contextual_translation in ${targetLang}",
          "context": "brief_explanation_if_needed in ${targetLang}",
          "position": {"line": 1, "index": 0}
        }
      ]
    }
  ]
}

Song lyrics to analyze:
${lyrics}

Important notes:
- All translations and explanations must be in ${targetLang}.
- Use the overall context to ensure accurate word translations.
- Maintain exact spacing and punctuation.
- For ${targetLang === 'Chinese (Mandarin)' ? 'Chinese, include pinyin in phonetic field' : targetLang === 'Cantonese (Yue Chinese)' ? 'Cantonese, include jyutping in phonetic field' : 'phonetic transcriptions, use IPA when possible'}.
- Focus on how words are used in this song context.
- If a word has multiple meanings, choose the one that fits the song.
- Handle contractions as separate words (e.g., "don't" = "do" + "not").
- Each lineTranslation should be a natural, fluent translation of the entire line in ${targetLang}.`;
}

/**
 * Parse detailed analysis response
 */
function parseDetailedAnalysis(
	response: string,
	sourceLanguage: string,
	targetLanguage: string
): LyricAnalysis {
	try {
		// Extract JSON from response (in case there's extra text)
		const jsonMatch = response.match(/\{[\s\S]*\}/);
		if (!jsonMatch) {
			throw new Error('No valid JSON found in detailed analysis response');
		}

		const parsed = JSON.parse(jsonMatch[0]);
		
		// Validate and normalize the structure
		if (!parsed.lines || !Array.isArray(parsed.lines)) {
			throw new Error('Invalid response structure: missing lines array');
		}

		const lines: LineAnalysis[] = parsed.lines.map((line: any, index: number) => ({
			originalLine: line.originalLine || '',
			lineNumber: line.lineNumber || index + 1,
			lineTranslation: line.lineTranslation || '',
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
		console.error('Failed to parse detailed analysis response:', error);
		throw new Error('Failed to parse detailed analysis response');
	}
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