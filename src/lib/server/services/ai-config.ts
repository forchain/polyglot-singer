// AI Service Configuration
// Supports multiple OpenAI-compatible providers
import type { AIProvider } from '$lib/types/ai-providers.js';
import { env as privateEnv } from '$env/dynamic/private';

export interface AIConfig {
	provider: AIProvider;
	key: string;
	baseURL?: string;
	model: string;
	detectionModel?: string;
	timeout?: number;
	maxTokens?: number;
	temperature?: number;
}

// Default configuration
export const defaultConfig: AIConfig = {
	provider: 'kimi',
	key: privateEnv.KIMI_API_KEY || '',
	baseURL: 'https://api.kimi.com/coding/v1',
	model: privateEnv.KIMI_MODEL || 'kimi-for-coding',
	detectionModel: privateEnv.KIMI_MODEL_DETECTION || 'kimi-for-coding',
	timeout: 300000,
	maxTokens: 4000,
	temperature: 0.3
};

// Provider-specific configurations
export const providerConfigs: Record<string, Partial<AIConfig>> = {
	doubao: {
		provider: 'doubao',
		baseURL: 'https://ark.cn-beijing.volces.com/api/v3',
		model: 'doubao-seed-1-6-flash-250615',
		detectionModel: 'doubao-seed-1-6-flash-250615'
	},
	deepseek: {
		provider: 'deepseek',
		baseURL: 'https://api.deepseek.com/v1',
		model: 'deepseek-chat',
		detectionModel: 'deepseek-chat'
	},
	openai: {
		provider: 'openai',
		baseURL: 'https://api.openai.com/v1',
		model: 'gpt-4o-mini',
		detectionModel: 'gpt-4.1-nano'
	},
	anthropic: {
		provider: 'anthropic',
		baseURL: 'https://api.anthropic.com',
		model: 'claude-3-5-sonnet-20241022',
		detectionModel: 'claude-3-haiku-20240307'
	},
	google: {
		provider: 'google',
		baseURL: 'https://generativelanguage.googleapis.com',
		model: 'gemini-1.5-pro',
		detectionModel: 'gemini-1.5-flash'
	},
	local: {
		provider: 'local',
		baseURL: 'http://localhost:11434/v1', // Ollama
		model: 'llama3.2:3b',
		detectionModel: 'llama3.2:3b'
	},
	custom: {
		provider: 'custom'
	},
	kimi: {
		provider: 'kimi',
		baseURL: 'https://api.kimi.com/coding/v1',
		model: 'kimi-for-coding',
		detectionModel: 'kimi-for-coding'
	}
};

// Get configuration for a specific provider
export function getAIConfig(provider?: string): AIConfig {
	const providerName = provider || privateEnv.AI_PROVIDER || 'kimi';
	const baseConfig = providerConfigs[providerName] || providerConfigs.kimi;

	if (providerName === 'doubao') {
		return {
			...defaultConfig,
			...baseConfig,
			key: privateEnv.DOUBAO_API_KEY || '',
			baseURL: 'https://ark.cn-beijing.volces.com/api/v3',
			model: privateEnv.DOUBAO_MODEL || baseConfig.model || defaultConfig.model,
			detectionModel: privateEnv.DOUBAO_MODEL_DETECTION || baseConfig.detectionModel || defaultConfig.detectionModel
		};
	} else if (providerName === 'deepseek') {
		return {
			...defaultConfig,
			...baseConfig,
			key: privateEnv.DEEPSEEK_API_KEY || '',
			baseURL: 'https://api.deepseek.com/v1',
			model: privateEnv.DEEPSEEK_MODEL || baseConfig.model || defaultConfig.model,
			detectionModel: privateEnv.DEEPSEEK_MODEL_DETECTION || baseConfig.detectionModel || defaultConfig.detectionModel
		};
	} else if (providerName === 'openai') {
		const openaiApiKey = privateEnv.OPENAI_API_KEY || '';
		const openaiModel = privateEnv.OPENAI_MODEL || baseConfig.model || defaultConfig.model;
		const openaiDetectionModel = privateEnv.OPENAI_MODEL_DETECTION || baseConfig.detectionModel || defaultConfig.detectionModel;
		return {
			...defaultConfig,
			...baseConfig,
			key: openaiApiKey,
			baseURL: 'https://api.openai.com/v1',
			model: openaiModel,
			detectionModel: openaiDetectionModel
		};
	} else if (providerName === 'custom') {
		const customApiKey = privateEnv.CUSTOM_AI_API_KEY || '';
		const customBaseUrl = privateEnv.CUSTOM_AI_BASE_URL || baseConfig.baseURL || defaultConfig.baseURL;
		const customModel = privateEnv.CUSTOM_AI_MODEL || baseConfig.model || defaultConfig.model;
		const customDetectionModel = privateEnv.CUSTOM_MODEL_DETECTION || customModel || baseConfig.detectionModel || defaultConfig.detectionModel;
		return {
			...defaultConfig,
			...baseConfig,
			key: customApiKey,
			baseURL: customBaseUrl,
			model: customModel,
			detectionModel: customDetectionModel
		};
	} else if (providerName === 'kimi') {
		return {
			...defaultConfig,
			...baseConfig,
			key: privateEnv.KIMI_API_KEY || '',
			baseURL: 'https://api.kimi.com/coding/v1',
			model: privateEnv.KIMI_MODEL || baseConfig.model || defaultConfig.model,
			detectionModel: privateEnv.KIMI_MODEL_DETECTION || baseConfig.detectionModel || defaultConfig.detectionModel
		};
	} else {
		return {
			...defaultConfig,
			...baseConfig
		};
	}
}

// Validate configuration
export function validateAIConfig(config: AIConfig): boolean {
	if (!config.key) {
		console.error('AI API key is required');
		return false;
	}
	if (!config.baseURL) {
		console.error('AI base URL is required');
		return false;
	}
	if (!config.model) {
		console.error('AI model is required');
		return false;
	}
	return true;
}

// Get supported providers
export function getSupportedProviders(): AIProvider[] {
	return Object.keys(providerConfigs) as AIProvider[];
}
