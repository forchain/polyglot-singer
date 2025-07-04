<script lang="ts">
	import { enhance } from '$app/forms';
	import LyricInput from '$lib/components/LyricInput.svelte';
	import LyricDisplay from '$lib/components/LyricDisplay.svelte';
	import LanguageSelector from '$lib/components/LanguageSelector.svelte';
	import AIProviderSelector from '$lib/components/AIProviderSelector.svelte';
	import type { LyricAnalysis } from '$lib/types/lyric.js';
	import type { AIProvider } from '$lib/types/ai-providers.js';
	import type { PageData } from './$types';
	import { onMount } from 'svelte';
	
	export let data: PageData;
	
	// Default values for testing
	let lyrics = `君はどこにいるの
君はどこへ行ったのか
远い旅にでも出たんだね
一番大切な人と`;
	let title = 'End Roll';
	let artist = '滨崎步';
	let sourceLanguage = 'ja';
	let targetLanguage = 'zh';
	let selectedProvider: AIProvider = 'deepseek';
	let analysis: LyricAnalysis | null = null;
	let isAnalyzing = false;
	let error: string | null = null;
	let historyList: { id: string; title?: string; artist?: string; createdAt?: string }[] = [];
	let selectedHistoryId = '';
	
	async function handleAnalyze() {
		if (!lyrics.trim()) {
			error = 'Please enter some lyrics to analyze';
			return;
		}
		
		isAnalyzing = true;
		error = null;
		
		try {
			const response = await fetch('/api/analyze', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					lyrics: lyrics.trim(),
					sourceLanguage,
					targetLanguage,
					provider: selectedProvider,
					title: title.trim() || undefined,
					artist: artist.trim() || undefined
				})
			});
			
			const result = await response.json();
			
			if (result.success) {
				analysis = result.analysis;
			} else {
				error = result.error || 'Analysis failed';
			}
		} catch (err) {
			console.error('Analysis error:', err);
			error = 'Network error. Please try again.';
		} finally {
			isAnalyzing = false;
		}
	}
	
	// Default demo values
	const demoValues = {
		lyrics: `君はどこにいるの
君はどこへ行ったのか
远い旅にでも出たんだね
一番大切な人と`,
		title: 'End Roll',
		artist: '滨崎步',
		sourceLanguage: 'ja',
		targetLanguage: 'zh'
	};

	function handleReset() {
		analysis = null;
		error = null;
		lyrics = '';
		title = '';
		artist = '';
	}

	function loadDemo() {
		lyrics = demoValues.lyrics;
		title = demoValues.title;
		artist = demoValues.artist;
		sourceLanguage = demoValues.sourceLanguage;
		targetLanguage = demoValues.targetLanguage;
		analysis = null;
		error = null;
	}
	
	function handleLanguageSwap() {
		const temp = sourceLanguage;
		sourceLanguage = targetLanguage;
		targetLanguage = temp;
	}

	async function fetchHistory() {
		const res = await fetch('/api/analyze/history');
		const data = await res.json();
		if (data.success) historyList = data.history;
	}

	async function handleHistorySelect() {
		if (!selectedHistoryId) return;
		const res = await fetch(`/api/analyze/history/${selectedHistoryId}`);
		const data = await res.json();
		if (data.success) {
			analysis = data.analysis;
		}
	}

	onMount(fetchHistory);
</script>

<svelte:head>
	<title>Analyze Lyrics - Polyglot Singer</title>
	<meta name="description" content="Analyze song lyrics with AI-powered translation and phonetic transcription" />
</svelte:head>

<div class="max-w-6xl mx-auto">
	<div class="text-center mb-8">
		<h1 class="text-4xl font-bold text-gray-900 mb-4">
			🎵 Analyze Song Lyrics
		</h1>
		<p class="text-xl text-gray-600">
			Get word-by-word translation and phonetic transcription for any song
		</p>
	</div>
	
	{#if !analysis}
		<!-- Input Form -->
		<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
			<form on:submit|preventDefault={handleAnalyze} class="space-y-6">
				<!-- Song metadata -->
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label for="title" class="form-label">Song Title (Optional)</label>
						<input 
							type="text" 
							id="title"
							bind:value={title}
							placeholder="Enter song title"
							class="form-input"
						/>
					</div>
					<div>
						<label for="artist" class="form-label">Artist (Optional)</label>
						<input 
							type="text" 
							id="artist"
							bind:value={artist}
							placeholder="Enter artist name"
							class="form-input"
						/>
					</div>
				</div>
				
				<!-- AI Provider and Language Settings -->
				<div class="space-y-4">
					<h3 class="text-lg font-semibold text-gray-900">Analysis Settings</h3>
					<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
						<!-- AI Provider Selection -->
						<div>
							<AIProviderSelector bind:selectedProvider />
						</div>
						
						<!-- Language Settings -->
						<div class="space-y-4">
							<h4 class="text-md font-medium text-gray-900">Language Settings</h4>
							<div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
								<div>
									<label class="form-label">From</label>
									<LanguageSelector bind:value={sourceLanguage} />
								</div>
								<div class="flex justify-center">
									<button
										type="button"
										on:click={handleLanguageSwap}
										class="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
										title="Swap languages"
									>
										<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
										</svg>
									</button>
								</div>
								<div>
									<label class="form-label">To</label>
									<LanguageSelector bind:value={targetLanguage} />
								</div>
							</div>
						</div>
					</div>
				</div>
				
				<!-- Lyrics input -->
				<div>
					<label for="lyrics" class="form-label">Song Lyrics</label>
					<LyricInput bind:value={lyrics} placeholder="Paste your song lyrics here..." />
					{#if lyrics === demoValues.lyrics}
						<p class="text-sm text-blue-600 mt-2">
							💡 Demo loaded: "End Roll" by 滨崎步 (Japanese → Chinese)
						</p>
					{/if}
				</div>
				
				<!-- Error display -->
				{#if error}
					<div class="bg-red-50 border border-red-200 rounded-md p-4">
						<div class="flex">
							<svg class="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
							<div class="ml-3">
								<p class="text-sm text-red-700">{error}</p>
							</div>
						</div>
					</div>
				{/if}
				
				<!-- Action buttons -->
				<div class="flex justify-center space-x-4">
					<button
						type="button"
						on:click={loadDemo}
						class="btn-secondary px-6 py-3 text-lg"
					>
						🎵 Load Demo
					</button>
					<button
						type="submit"
						disabled={isAnalyzing || !lyrics.trim()}
						class="btn-primary px-8 py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{#if isAnalyzing}
							<div class="loading-spinner w-5 h-5 mr-2"></div>
							Analyzing...
						{:else}
							✨ Analyze Lyrics
						{/if}
					</button>
				</div>
			</form>
		</div>
		
		<!-- Demo section for non-authenticated users -->
		{#if !data.user}
			<div class="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
				<h3 class="text-lg font-semibold text-blue-900 mb-2">
					👆 Try the demo above, or sign up to save your lyrics
				</h3>
				<p class="text-blue-700 mb-4">
					Create an account to save your analyzed lyrics and track your learning progress.
				</p>
				<a href="/register" class="btn-primary">
					Sign Up Free
				</a>
			</div>
		{/if}
	{:else}
		<!-- Analysis Results -->
		<div class="space-y-6">
			<!-- Header with song info and controls -->
			<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
				<div class="flex flex-col md:flex-row md:items-center md:justify-between">
					<div>
						{#if analysis.title || analysis.artist}
							<h2 class="text-2xl font-bold text-gray-900">
								{analysis.title || 'Untitled'}
								{#if analysis.artist}
									<span class="text-gray-600">by {analysis.artist}</span>
								{/if}
							</h2>
						{:else}
							<h2 class="text-2xl font-bold text-gray-900">Analyzed Lyrics</h2>
						{/if}
						<p class="text-gray-600 mt-1">
							{analysis.sourceLanguage.toUpperCase()} → {analysis.targetLanguage.toUpperCase()}
						</p>
					</div>
					<div class="mt-4 md:mt-0 flex space-x-3">
						<button on:click={handleReset} class="btn-secondary">
							📝 Analyze New Song
						</button>
						{#if data.user}
							<button class="btn-primary">
								💾 Save to Library
							</button>
						{/if}
					</div>
				</div>
			</div>
			
			<!-- Lyric display -->
			<LyricDisplay {analysis} />
		</div>
	{/if}

	<!-- 历史记录下拉框 -->
	{#if historyList.length > 0}
	<div class="mb-4">
		<label class="form-label">历史记录：</label>
		<select bind:value={selectedHistoryId} on:change={handleHistorySelect} class="form-select">
			<option value="">选择历史记录</option>
			{#each historyList as item}
				<option value={item.id}>
					{(item.title || '未命名') + ' - ' + (item.artist || '未知歌手')}
				</option>
			{/each}
		</select>
	</div>
	{/if}
</div> 