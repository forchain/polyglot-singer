// AI Service Configuration
// Supports multiple OpenAI-compatible providers
import type { AIProvider } from '$lib/types/ai-providers.js';
import {
	DEEPSEEK_API_KEY,
	DEEPSEEK_MODEL,
	DEEPSEEK_MODEL_DETECTION
} from '$env/static/private';

export interface AIConfig {
	provider: AIProvider;
	apiKey: string;
	baseURL?: string;
	model: string;
	detectionModel?: string;
	timeout?: number;
	maxTokens?: number;
	temperature?: number;
}

// Default configuration
export const defaultConfig: AIConfig = {
	provider: 'deepseek',
	apiKey: DEEPSEEK_API_KEY || '',
	baseURL: 'https://api.deepseek.com/v1',
	model: DEEPSEEK_MODEL || 'deepseek-chat',
	detectionModel: DEEPSEEK_MODEL_DETECTION || 'deepseek-chat',
	timeout: 30000,
	maxTokens: 4000,
	temperature: 0.3
};

// Provider-specific configurations
export const providerConfigs: Record<string, Partial<AIConfig>> = {
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
	// Custom providers can be added here
	custom: {
		provider: 'custom'
	}
};

// Get configuration for a specific provider
export function getAIConfig(provider?: string): AIConfig {
	const providerName = provider || 'deepseek';
	const baseConfig = providerConfigs[providerName] || providerConfigs.deepseek;

	if (providerName === 'deepseek') {
		return {
			...defaultConfig,
			...baseConfig,
			apiKey: DEEPSEEK_API_KEY || '',
			baseURL: 'https://api.deepseek.com/v1',
			model: DEEPSEEK_MODEL || baseConfig.model || defaultConfig.model,
			detectionModel: DEEPSEEK_MODEL_DETECTION || baseConfig.detectionModel || defaultConfig.detectionModel
		};
	} else if (providerName === 'openai') {
		// For OpenAI, we'll use environment variables if available, otherwise use defaults
		const openaiApiKey = process.env.OPENAI_API_KEY || '';
		const openaiModel = process.env.OPENAI_MODEL || baseConfig.model || defaultConfig.model;
		const openaiDetectionModel = process.env.OPENAI_MODEL_DETECTION || baseConfig.detectionModel || defaultConfig.detectionModel;
		
		return {
			...defaultConfig,
			...baseConfig,
			apiKey: openaiApiKey,
			baseURL: 'https://api.openai.com/v1',
			model: openaiModel,
			detectionModel: openaiDetectionModel
		};
	} else if (providerName === 'custom') {
		// For custom providers, we'll use environment variables if available, otherwise use defaults
		const customApiKey = process.env.CUSTOM_AI_API_KEY || '';
		const customBaseUrl = process.env.CUSTOM_AI_BASE_URL || baseConfig.baseURL || defaultConfig.baseURL;
		const customModel = process.env.CUSTOM_AI_MODEL || baseConfig.model || defaultConfig.model;
		const customDetectionModel = process.env.CUSTOM_MODEL_DETECTION || customModel || baseConfig.detectionModel || defaultConfig.detectionModel;
		
		return {
			...defaultConfig,
			...baseConfig,
			apiKey: customApiKey,
			baseURL: customBaseUrl,
			model: customModel,
			detectionModel: customDetectionModel
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
	if (!config.apiKey) {
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