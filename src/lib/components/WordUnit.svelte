<script lang="ts">
	import type { WordAnalysis } from '$lib/types/lyric.js';

	export let word: WordAnalysis;
</script>

<div class="word-unit inline-block mx-1 my-1">
	<div class="phonetic text-xs text-gray-500 text-center mb-1">
		{word.phonetic}
	</div>
	<div class="original text-lg font-medium text-center">
		{word.word}
	</div>
	<div class="translation text-xs text-gray-600 text-center mt-1">
		{word.translation}
	</div>
</div>

<style>
	.word-unit {
		min-width: 60px;
		cursor: pointer;
		transition: all 0.2s ease;
		padding: 0.5rem;
		border-radius: 0.5rem;
	}

	.word-unit:hover {
		background-color: #f3f4f6;
		transform: translateY(-1px);
	}

	.phonetic {
		font-family: 'Courier New', monospace;
		font-size: 0.75rem;
		line-height: 1;
	}

	.original {
		font-weight: 500;
		line-height: 1.2;
	}

	.translation {
		font-size: 0.75rem;
		line-height: 1;
		max-width: 80px;
		word-wrap: break-word;
	}
</style> 