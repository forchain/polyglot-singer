<script lang="ts">
	import { supportedProviders, providerDisplayNames } from '$lib/types/ai-providers.js';
	import type { AIProvider } from '$lib/types/ai-providers.js';
	
	export let selectedProvider: AIProvider = 'openai';
	export let disabled = false;
	
	function handleProviderChange(event: Event) {
		const target = event.target as HTMLSelectElement;
		selectedProvider = target.value as AIProvider;
	}
</script>

<div class="space-y-2">
	<label class="form-label">AI Provider</label>
	<select 
		value={selectedProvider}
		on:change={handleProviderChange}
		{disabled}
		class="form-select"
	>
		{#each supportedProviders as provider}
			<option value={provider}>
				{providerDisplayNames[provider] || provider}
			</option>
		{/each}
	</select>
	
	{#if selectedProvider === 'local'}
		<div class="text-sm text-amber-600 bg-amber-50 p-3 rounded-md">
			⚠️ <strong>Local Model:</strong> Make sure you have Ollama running locally with the selected model installed.
		</div>
	{:else if selectedProvider === 'custom'}
		<div class="text-sm text-blue-600 bg-blue-50 p-3 rounded-md">
			ℹ️ <strong>Custom Provider:</strong> Configure your custom AI provider in the environment variables.
		</div>
	{/if}
</div> 