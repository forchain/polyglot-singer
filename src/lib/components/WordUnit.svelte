<script lang="ts">
	import type { WordAnalysis } from '$lib/types/lyric.js';

	export let word: WordAnalysis;
	export let sourceLanguage: string;
	export let selectedVoice: string = '';

	function speakWord() {
		if (!window.speechSynthesis) return;
		const utter = new window.SpeechSynthesisUtterance(word.word);
		utter.lang = mapLang(sourceLanguage);
		const voices = window.speechSynthesis.getVoices();
		const match = selectedVoice
			? voices.find(v => v.voiceURI === selectedVoice)
			: voices.find(v => v.lang.startsWith(utter.lang));
		if (match) utter.voice = match;
		window.speechSynthesis.speak(utter);
	}

	function mapLang(code: string): string {
		// 简单映射，后续可扩展
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

<div class="word-unit inline-block mx-1 my-1" on:click={speakWord} title="点击朗读">
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