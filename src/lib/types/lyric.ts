// Core lyric analysis types
export interface WordAnalysis {
	word: string;
	phonetic: string;
	translation: string;
	context: string;
	position: {
		line: number;
		index: number;
	};
	confidence?: number;
}

export interface LineAnalysis {
	originalLine: string;
	words: WordAnalysis[];
	lineNumber: number;
	lineTranslation?: string; // 整句翻译
}

export interface LyricAnalysis {
	title?: string;
	artist?: string;
	sourceLanguage: string;
	targetLanguage: string;
	summary?: string; // 整体总结
	overallTranslation?: string; // 整体翻译
	lines: LineAnalysis[];
	metadata?: {
		processingTime: number;
		model: string;
		timestamp: Date;
	};
}

// API request/response types
export interface AnalyzeLyricsRequest {
	lyrics: string;
	sourceLanguage?: string;
	targetLanguage?: string;
	title?: string;
	artist?: string;
}

export interface AnalyzeLyricsResponse {
	success: boolean;
	analysis?: LyricAnalysis;
	error?: string;
}

// Language configuration
export interface LanguageConfig {
	code: string;
	name: string;
	nativeName: string;
	flag: string;
	supported: boolean;
}

// Supported languages for the application
export const SUPPORTED_LANGUAGES: LanguageConfig[] = [
	{ code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', supported: true },
	{ code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳', supported: true },
	{ code: 'yue', name: 'Cantonese', nativeName: '粵語/广东话', flag: '🇭🇰', supported: true },
	{ code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', supported: true },
	{ code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', supported: true },
	{ code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', supported: true },
	{ code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', supported: true },
	{ code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷', supported: true },
	{ code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹', supported: true },
	{ code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹', supported: true },
	{ code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', supported: true }
];

// Phonetic style options
export type PhoneticStyle = 'ipa' | 'simplified' | 'native';

export interface PhoneticConfig {
	style: PhoneticStyle;
	showTones?: boolean; // For tonal languages like Chinese
	useNativeScript?: boolean; // For languages with different scripts
} 