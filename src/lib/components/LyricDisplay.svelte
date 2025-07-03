<script lang="ts">
	import type { LyricAnalysis } from '$lib/types/lyric.js';
	import WordUnit from './WordUnit.svelte';

	export let analysis: LyricAnalysis;
</script>

<div class="lyric-display space-y-6">
	{#each analysis.lines as line}
		<div class="lyric-line">
			<div class="flex flex-wrap gap-2 items-start">
				{#each line.words as word}
					<WordUnit {word} />
				{/each}
			</div>
		</div>
	{/each}
</div>

<style>
	.lyric-display {
		font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
		line-height: 1.6;
	}

	.lyric-line {
		margin-bottom: 1.5rem;
	}
</style> 