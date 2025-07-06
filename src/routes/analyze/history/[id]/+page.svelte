<script lang="ts">
import { error } from '@sveltejs/kit';
import LyricDisplay from '$lib/components/LyricDisplay.svelte';
import type { LyricAnalysis } from '$lib/types/lyric';
import { onMount } from 'svelte';

export let data: { analysis: LyricAnalysis | null, selectedVoice: string };
let analysis: LyricAnalysis | null = data.analysis;
let selectedVoice: string = data.selectedVoice;

</script>

<svelte:head>
	<title>分析结果 - Polyglot Singer</title>
</svelte:head>

<div class="max-w-4xl mx-auto py-8">
	{#if !analysis}
		<div class="flex flex-col items-center justify-center py-16">
			<div class="loading-spinner w-8 h-8 mb-4"></div>
			<p class="text-gray-500 text-lg">正在加载歌词分析…</p>
		</div>
	{:else}
		<LyricDisplay {analysis} bind:selectedVoice />
	{/if}
</div>

<style>
.loading-spinner {
	border: 4px solid #f3f3f3;
	border-top: 4px solid #3498db;
	border-radius: 50%;
	width: 32px;
	height: 32px;
	animation: spin 1s linear infinite;
}
@keyframes spin {
	0% { transform: rotate(0deg); }
	100% { transform: rotate(360deg); }
}
</style>

<!-- SSR/CSR 数据加载在 +page.ts 中实现 --> 