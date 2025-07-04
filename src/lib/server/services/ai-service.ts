import OpenAI from 'openai';
import { OPENAI_API_KEY } from '$env/static/private';
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

		console.log(`[AI] [${Date.now() - startTime}ms] Creating prompt...`);
		const prompt = createAnalysisPrompt(lyrics, sourceLanguage, targetLanguage);
		console.log(`[AI] [${Date.now() - startTime}ms] Prompt created. Length: ${prompt.length}`);

		console.log(`[AI] [${Date.now() - startTime}ms] Sending request to OpenAI API...`);
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
		console.log(`[AI] [${Date.now() - startTime}ms] OpenAI API responded.`);

		const response = completion.choices[0]?.message?.content;
		if (!response) {
			console.error(`[AI] [${Date.now() - startTime}ms] No response from OpenAI API`);
			throw new Error('No response from OpenAI API');
		}

		console.log(`[AI] [${Date.now() - startTime}ms] Parsing AI response...`);
		const analysis = parseAIResponse(response, sourceLanguage, targetLanguage);
		console.log(`[AI] [${Date.now() - startTime}ms] AI response parsed.`);

		// Add metadata
		analysis.title = title;
		analysis.artist = artist;
		analysis.metadata = {
			processingTime: Date.now() - startTime,
			model: `${aiConfig.provider}:${aiConfig.model}`,
			timestamp: new Date()
		};

		console.log(`[AI] [${Date.now() - startTime}ms] Returning analysis result.`);
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