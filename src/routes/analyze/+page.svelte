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
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { franc } from 'franc';
	
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
	let selectedProvider: AIProvider = 'doubao';
	let analysis: LyricAnalysis | null = null;
	let isAnalyzing = false;
	let error: string | null = null;
	let selectedVoice = '';
	let defaultVoices: Record<string, string> = {};
	let isLoadingAnalysis = false;
	let lastLyricsForDetect = '';
	let autoDetectedLanguage = '';
	
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
			
			if (result.success && result.analysis && result.analysis.id) {
				// 轮询查找，查到再跳转
				await waitForAnalysis(result.analysis.id);
				goto(`/analyze/history/${result.analysis.id}`);
				return;
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

	async function loadDefaultVoices() {
		// 优先后端
		try {
			const res = await fetch('/api/user/preferences');
			const data = await res.json();
			console.log('【voice debug】后端返回', data);
			if (data.success && data.preferences && data.preferences.defaultVoices) {
				defaultVoices = JSON.parse(data.preferences.defaultVoices);
				console.log('【voice debug】使用后端defaultVoices', defaultVoices);
			} else {
				const saved = localStorage.getItem('defaultVoices');
				if (saved) {
					defaultVoices = JSON.parse(saved);
					console.log('【voice debug】后端无数据，使用本地defaultVoices', defaultVoices);
				}
			}
		} catch (e) {
			const saved = localStorage.getItem('defaultVoices');
			if (saved) {
				defaultVoices = JSON.parse(saved);
				console.log('【voice debug】后端异常，使用本地defaultVoices', defaultVoices);
			}
			console.log('【voice debug】loadDefaultVoices异常', e);
		}
	}

	onMount(async () => {
		await loadDefaultVoices();
		// 检查URL参数historyId，自动加载分析
		const url = new URL(window.location.href);
		const historyId = url.searchParams.get('historyId');
		if (historyId) {
			isLoadingAnalysis = true;
			fetch(`/api/analyze/history/${historyId}`)
				.then(res => res.json())
				.then(data => {
					if (data.success) {
						analysis = data.analysis;
						// 自动应用全局voice
						if (analysis && analysis.sourceLanguage && defaultVoices[analysis.sourceLanguage]) {
							selectedVoice = defaultVoices[analysis.sourceLanguage];
							console.log('【voice debug】historyId加载，设置selectedVoice', selectedVoice);
						}
					}
				})
				.finally(() => {
					isLoadingAnalysis = false;
				});
		}
	});

	$: if (analysis && analysis.sourceLanguage && defaultVoices[analysis.sourceLanguage]) {
		selectedVoice = defaultVoices[analysis.sourceLanguage];
		console.log('【voice debug】$reactive设置selectedVoice', selectedVoice, analysis.sourceLanguage, defaultVoices);
	}

	async function waitForAnalysis(id, maxTries = 10, delay = 300) {
		for (let i = 0; i < maxTries; i++) {
			const res = await fetch(`/api/analyze/history/${id}`);
			const data = await res.json();
			if (data.success) return true;
			await new Promise(r => setTimeout(r, delay));
		}
		return false;
	}

	// 监听歌词输入，只有内容变化时才自动检测语言
	$: if (lyrics && lyrics.length > 5 && lyrics !== lastLyricsForDetect) {
		const lang = franc(lyrics);
		const map: Record<string, string> = { 'cmn': 'zh', 'jpn': 'ja', 'eng': 'en', 'fra': 'fr', 'spa': 'es', 'deu': 'de', 'kor': 'ko', 'ita': 'it', 'por': 'pt', 'rus': 'ru' };
		if (lang && map[lang]) {
			autoDetectedLanguage = map[lang];
			sourceLanguage = map[lang];
		}
		lastLyricsForDetect = lyrics;
	}

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
	
	{#if isLoadingAnalysis}
		<div class="flex flex-col items-center justify-center py-16">
			<div class="loading-spinner w-8 h-8 mb-4"></div>
			<p class="text-gray-500 text-lg">正在加载歌词分析…</p>
		</div>
	{:else}
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
				<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
					<!-- AI Provider 区域 -->
					<div class="flex flex-col">
						<label class="form-label mb-2">AI Provider</label>
						<AIProviderSelector bind:selectedProvider />
					</div>
					<!-- Language Settings 区域 -->
					<div class="flex flex-col">
						<label class="form-label mb-2">Language Settings</label>
						<div class="grid grid-cols-5 gap-2 items-end">
							<div class="col-span-2">
								<LanguageSelector bind:value={sourceLanguage} />
							</div>
							<div class="flex justify-center items-center">
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
							<div class="col-span-2">
								<LanguageSelector bind:value={targetLanguage} />
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
	{/if}
</div> 