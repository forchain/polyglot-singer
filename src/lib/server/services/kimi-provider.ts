import type { AIConfig } from './ai-config.js';

export interface KimiMessage {
	role: 'system' | 'user' | 'assistant';
	content: string;
}

export interface KimiResponse {
	id: string;
	type: 'message';
	role: 'assistant';
	content: Array<{ type: 'text'; text: string }>;
	model: string;
	stop_reason: string;
	usage: {
		input_tokens: number;
		output_tokens: number;
	};
}

/**
 * Kimi-coding provider using Anthropic Messages API format.
 * Accepts standard OpenAI-style messages (including system role) and converts
 * them to the Anthropic Messages shape expected by Kimi-coding.
 */
export async function kimiChat(
	config: AIConfig,
	messages: KimiMessage[],
	options: { maxTokens?: number; temperature?: number; system?: string } = {}
): Promise<string> {
	if (!config.key) {
		throw new Error('KIMI_API_KEY is required for kimi provider');
	}
	const url = config.baseURL?.replace(/\/$/, '') + '/v1/messages';

	// Extract system message(s) for Anthropic's top-level system parameter.
	let system = options.system || '';
	const nonSystemMessages: KimiMessage[] = [];
	for (const m of messages) {
		if (m.role === 'system') {
			system = system ? `${system}\n\n${m.content}` : m.content;
		} else {
			nonSystemMessages.push(m);
		}
	}

	const body: Record<string, unknown> = {
		model: config.model,
		max_tokens: options.maxTokens ?? config.maxTokens ?? 4000,
		messages: nonSystemMessages
	};
	if (options.temperature ?? config.temperature) {
		body.temperature = options.temperature ?? config.temperature;
	}
	if (system) {
		body.system = system;
	}

	const response = await fetch(url, {
		method: 'POST',
		headers: {
			'x-api-key': config.key,
			'anthropic-version': '2023-06-01',
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(body)
	});

	if (!response.ok) {
		const text = await response.text();
		throw new Error(`Kimi API error ${response.status}: ${text}`);
	}

	const data = (await response.json()) as KimiResponse;
	const text = data.content.find((c) => c.type === 'text')?.text;
	if (!text) {
		throw new Error('Kimi API returned no text content');
	}
	return text;
}
