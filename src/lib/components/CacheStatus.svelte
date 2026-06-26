<script lang="ts">
	import { onMount } from 'svelte';
	import { audioCache } from '$lib/utils/audioCache.js';

	let stats = { size: 0, maxSize: 50 };
	let showDetails = false;

	function updateStats() {
		stats = audioCache.getStats();
	}

	function clearAllCache() {
		audioCache.clear();
		updateStats();
	}

	onMount(() => {
		updateStats();
		// 定期更新统计信息
		const interval = setInterval(updateStats, 5000);
		return () => clearInterval(interval);
	});
</script>

<div class="cache-status text-xs text-gray-500">
	<button
		class="flex items-center gap-1 hover:text-gray-700"
		on:click={() => showDetails = !showDetails}
		title="缓存状态"
	>
		💾 缓存: {stats.size}/{stats.maxSize}
		{#if stats.size > 0}
			<span class="text-green-500">●</span>
		{:else}
			<span class="text-gray-300">○</span>
		{/if}
	</button>

	{#if showDetails}
		<div class="cache-details mt-2 p-2 bg-gray-50 rounded text-xs">
			<div class="mb-2">
				<span class="font-medium">缓存状态:</span>
				{#if stats.size === 0}
					<span class="text-gray-500">无缓存</span>
				{:else if stats.size < stats.maxSize * 0.5}
					<span class="text-green-600">正常</span>
				{:else if stats.size < stats.maxSize * 0.8}
					<span class="text-yellow-600">较多</span>
				{:else}
					<span class="text-red-600">已满</span>
				{/if}
			</div>
			<div class="mb-2">
				<span class="font-medium">使用情况:</span>
				<span>{Math.round((stats.size / stats.maxSize) * 100)}%</span>
			</div>
			{#if stats.size > 0}
				<button
					class="text-red-600 hover:text-red-800 underline"
					on:click={clearAllCache}
				>
					清空所有缓存
				</button>
			{/if}
		</div>
	{/if}
</div>

<style>
	.cache-status {
		position: fixed;
		bottom: 10px;
		right: 10px;
		z-index: 1000;
		background: rgba(255, 255, 255, 0.9);
		padding: 4px 8px;
		border-radius: 4px;
		backdrop-filter: blur(4px);
	}

	.cache-details {
		position: absolute;
		bottom: 100%;
		right: 0;
		width: 200px;
		margin-bottom: 4px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}
</style> 