// AI Service Configuration
// Supports multiple OpenAI-compatible providers
import type { AIProvider } from '$lib/types/ai-providers.js';

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
	provider: 'openai',
	apiKey: process.env.OPENAI_API_KEY || '',
	baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
	model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
	detectionModel: process.env.OPENAI_MODEL_DETECTION || 'gpt-4.1-nano',
	timeout: 30000,
	maxTokens: 4000,
	temperature: 0.3
};

// Provider-specific configurations
export const providerConfigs: Record<string, Partial<AIConfig>> = {
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
		provider: 'custom',
		baseURL: process.env.CUSTOM_AI_BASE_URL,
		model: process.env.CUSTOM_AI_MODEL || 'default-model'
	}
};

// Get configuration for a specific provider
export function getAIConfig(provider?: string): AIConfig {
	const providerName = provider || process.env.AI_PROVIDER || 'openai';
	const baseConfig = providerConfigs[providerName] || providerConfigs.openai;
	
	return {
		...defaultConfig,
		...baseConfig,
		apiKey: process.env[`${providerName.toUpperCase()}_API_KEY`] || process.env.OPENAI_API_KEY || '',
		baseURL: process.env[`${providerName.toUpperCase()}_BASE_URL`] || baseConfig.baseURL || defaultConfig.baseURL,
		model: process.env[`${providerName.toUpperCase()}_MODEL`] || baseConfig.model || defaultConfig.model,
		detectionModel: process.env[`${providerName.toUpperCase()}_DETECTION_MODEL`] || baseConfig.detectionModel || defaultConfig.detectionModel
	};
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