<script lang="ts">
	import type { LyricAnalysis } from '$lib/types/lyric.js';
	import WordUnit from './WordUnit.svelte';

	export let analysis: LyricAnalysis;

	// 全局voice选择
	let voices: SpeechSynthesisVoice[] = [];
	let selectedVoice: string = '';

	function getVoicesForLang(lang: string) {
		const allVoices = window.speechSynthesis?.getVoices?.() || [];
		return allVoices.filter(v => v.lang.startsWith(mapLang(lang)));
	}

	function handleVoiceInit() {
		voices = getVoicesForLang(analysis.sourceLanguage);
		if (!selectedVoice && voices.length > 0) {
			selectedVoice = voices[0].voiceURI;
		}
	}

	if (typeof window !== 'undefined' && window.speechSynthesis) {
		window.speechSynthesis.onvoiceschanged = handleVoiceInit;
	}

	$: if (analysis) handleVoiceInit();

	function speakLine(line: string, lang: string) {
		if (!window.speechSynthesis) return;
		const utter = new window.SpeechSynthesisUtterance(line);
		utter.lang = mapLang(lang);
		utter.rate = 0.5;
		const allVoices = window.speechSynthesis.getVoices();
		const match = allVoices.find(v => v.voiceURI === selectedVoice) || allVoices.find(v => v.lang.startsWith(utter.lang));
		if (match) utter.voice = match;
		window.speechSynthesis.speak(utter);
	}

	function mapLang(code: string): string {
		if (code === 'zh') return 'zh-CN';
		if (code === 'en') return 'en-US';
		if (code === 'fr') return 'fr-FR';
		if (code === 'es') return 'es-ES';
		if (code === 'de') return 'de-DE';
		if (code === 'ja') return 'ja-JP';
		if (code === 'ko') return 'ko-KR';
		if (code === 'it') return 'it-IT';
		if (code === 'pt') return 'pt-PT';
		if (code === 'ru') return 'ru-RU';
		return code;
	}
</script>

<!-- 全局voice选择 -->
<div class="flex items-center gap-2 mb-4">
	<label class="text-sm text-gray-600">发音Voice：</label>
	<select
		bind:value={selectedVoice}
		class="text-xs border rounded px-1 py-0.5"
	>
		{#each voices as v}
			<option value={v.voiceURI}>{v.name} ({v.lang})</option>
		{/each}
	</select>
</div>

<div class="lyric-display space-y-6">
	<!-- 整体总结 -->
	{#if analysis.summary}
		<div class="summary-section bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
			<h3 class="text-lg font-semibold text-blue-800 mb-2">🎵 歌曲总结</h3>
			<p class="text-blue-700 leading-relaxed">{analysis.summary}</p>
		</div>
	{/if}

	<!-- 整体翻译 -->
	{#if analysis.overallTranslation}
		<div class="translation-section bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
			<h3 class="text-lg font-semibold text-green-800 mb-2">📝 整体翻译</h3>
			<p class="text-green-700 leading-relaxed whitespace-pre-line">{analysis.overallTranslation}</p>
		</div>
	{/if}

	<!-- 逐行分析 -->
	<div class="line-analysis-section">
		<h3 class="text-lg font-semibold text-gray-800 mb-4">🔍 逐字分析</h3>
		{#each analysis.lines as line}
			<div class="lyric-line relative mb-6 p-4 border border-gray-200 rounded-lg">
				<!-- 朗读整句按钮 -->
				<button
					type="button"
					class="absolute right-2 top-2 text-gray-400 hover:text-primary-600 text-sm px-2 py-1 rounded focus:outline-none"
					on:click={() => speakLine(line.words.map(w => w.word).join(' '), analysis.sourceLanguage)}
					title="朗读整句"
				>
					🔊 朗读整句
				</button>
				
				<!-- 原文 -->
				<div class="mb-3">
					<span class="text-xs text-gray-500 font-mono">第 {line.lineNumber} 行</span>
					<div class="flex flex-wrap gap-2 items-start mt-1">
						{#each line.words as word}
							<WordUnit {word} sourceLanguage={analysis.sourceLanguage} selectedVoice={selectedVoice} />
						{/each}
					</div>
				</div>

				<!-- 整句翻译 -->
				{#if line.lineTranslation}
					<div class="line-translation bg-gray-50 p-3 rounded border-l-2 border-gray-300">
						<span class="text-xs text-gray-500 font-mono">整句翻译</span>
						<p class="text-gray-700 mt-1">{line.lineTranslation}</p>
					</div>
				{/if}
			</div>
		{/each}
	</div>
</div>

<style>
	.lyric-display {
		font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
		line-height: 1.6;
	}

	.lyric-line {
		margin-bottom: 1.5rem;
	}

	.summary-section, .translation-section {
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	.line-translation {
		box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);
	}
</style> 