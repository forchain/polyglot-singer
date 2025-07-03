// Client-side AI provider types and configurations
export type AIProvider = 'openai' | 'anthropic' | 'google' | 'local' | 'custom';

export const providerDisplayNames: Record<AIProvider, string> = {
	openai: 'OpenAI (GPT-4, GPT-3.5)',
	anthropic: 'Anthropic (Claude)',
	google: 'Google (Gemini)',
	local: 'Local (Ollama)',
	custom: 'Custom Provider'
};

export const supportedProviders: AIProvider[] = ['openai', 'anthropic', 'google', 'local', 'custom'];

export interface ProviderInfo {
	name: string;
	description: string;
	requiresApiKey: boolean;
	configUrl?: string;
}

export const providerInfo: Record<AIProvider, ProviderInfo> = {
	openai: {
		name: 'OpenAI',
		description: 'GPT-4 and GPT-3.5 models from OpenAI',
		requiresApiKey: true,
		configUrl: 'https://platform.openai.com/api-keys'
	},
	anthropic: {
		name: 'Anthropic Claude',
		description: 'Claude models from Anthropic',
		requiresApiKey: true,
		configUrl: 'https://console.anthropic.com/'
	},
	google: {
		name: 'Google Gemini',
		description: 'Gemini models from Google',
		requiresApiKey: true,
		configUrl: 'https://makersuite.google.com/app/apikey'
	},
	local: {
		name: 'Local (Ollama)',
		description: 'Local models running via Ollama',
		requiresApiKey: false
	},
	custom: {
		name: 'Custom Provider',
		description: 'Your own OpenAI-compatible API endpoint',
		requiresApiKey: true
	}
}; 