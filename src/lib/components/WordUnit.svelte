<script lang="ts">
	import type { WordAnalysis, WordGrammarAnalysis } from '$lib/types/lyric.js';
	import { onMount } from 'svelte';
	import RecordingMenu from './RecordingMenu.svelte';

	export let word: WordAnalysis;
	export let sourceLanguage: string;
	export let targetLanguage: string; // 新增目标语言
	export let selectedVoice: string = '';
	export let lyricId: string = ''; // 新增歌词ID

	// 语法分析相关状态
	let grammarAnalysis: WordGrammarAnalysis | null = null;
	let isAnalyzing = false;
	let showGrammarModal = false;

	// 客户端缓存
	let wordCache = new Map<string, WordGrammarAnalysis>();

	// 单击/双击互斥逻辑
	let clickTimer: ReturnType<typeof setTimeout> | null = null;
	const CLICK_DELAY = 250;

	// 长按菜单相关状态
	let longPressTimer: ReturnType<typeof setTimeout> | null = null;
	let showRecordingMenu = false;
	let menuPosition = { x: 0, y: 0 };
	const LONG_PRESS_DELAY = 500; // 长按500ms触发菜单

	function handleClick() {
		if (clickTimer) return;
		clickTimer = setTimeout(() => {
			speakWord();
			clickTimer = null;
		}, CLICK_DELAY);
	}

	async function handleDoubleClick() {
		if (clickTimer) {
			clearTimeout(clickTimer);
			clickTimer = null;
		}
		await analyzeWordGrammar();
	}

	// 长按开始
	function handleMouseDown(event: MouseEvent) {
		// 阻止默认行为，防止触发点击事件
		event.preventDefault();
		longPressTimer = setTimeout(() => {
			showRecordingMenu = true;
			menuPosition = { x: event.clientX, y: event.clientY };
		}, LONG_PRESS_DELAY);
	}

	// 长按结束
	function handleMouseUp(event: MouseEvent) {
		if (longPressTimer) {
			clearTimeout(longPressTimer);
			longPressTimer = null;
		}
		// 如果菜单已显示，阻止默认行为
		if (showRecordingMenu) {
			event.preventDefault();
		}
	}

	// 长按取消
	function handleMouseLeave() {
		if (longPressTimer) {
			clearTimeout(longPressTimer);
			longPressTimer = null;
		}
	}

	// 右键菜单
	function handleContextMenu(event: MouseEvent) {
		event.preventDefault(); // 阻止浏览器默认右键菜单
		showRecordingMenu = true;
		menuPosition = { x: event.clientX, y: event.clientY };
	}

	// 触摸开始
	function handleTouchStart(event: TouchEvent) {
		event.preventDefault(); // 阻止默认行为
		const touch = event.touches[0];
		longPressTimer = setTimeout(() => {
			showRecordingMenu = true;
			menuPosition = { x: touch.clientX, y: touch.clientY };
		}, LONG_PRESS_DELAY);
	}

	// 触摸结束
	function handleTouchEnd(event: TouchEvent) {
		if (longPressTimer) {
			clearTimeout(longPressTimer);
			longPressTimer = null;
		}
		// 如果菜单已显示，阻止默认行为
		if (showRecordingMenu) {
			event.preventDefault();
		}
	}

	// 触摸移动
	function handleTouchMove(event: TouchEvent) {
		if (longPressTimer) {
			clearTimeout(longPressTimer);
			longPressTimer = null;
		}
	}

	// 关闭录音菜单
	function closeRecordingMenu() {
		showRecordingMenu = false;
	}

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

	async function analyzeWordGrammar() {
		const cacheKey = `${word.word.toLowerCase()}_${targetLanguage}`;
		// 检查客户端缓存
		if (wordCache.has(cacheKey)) {
			grammarAnalysis = wordCache.get(cacheKey)!;
			showGrammarModal = true;
			return;
		}
		isAnalyzing = true;
		try {
			const response = await fetch('/api/word/grammar', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					word: word.word,
					language: targetLanguage
				})
			});
			const result = await response.json();
			if (result.success && result.analysis) {
				grammarAnalysis = result.analysis;
				wordCache.set(cacheKey, result.analysis);
				showGrammarModal = true;
			} else {
				console.error('语法分析失败:', result.error);
				alert('语法分析失败: ' + result.error);
			}
		} catch (error) {
			console.error('请求语法分析失败:', error);
			alert('请求失败，请稍后重试');
		} finally {
			isAnalyzing = false;
		}
	}

	function closeModal() {
		showGrammarModal = false;
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

<button 
	class="word-unit inline-block mx-1 my-1" 
	on:click={handleClick} 
	on:dblclick={handleDoubleClick}
	on:mousedown={handleMouseDown}
	on:mouseup={handleMouseUp}
	on:mouseleave={handleMouseLeave}
	on:contextmenu={handleContextMenu}
	on:touchstart={handleTouchStart}
	on:touchend={handleTouchEnd}
	on:touchmove={handleTouchMove}
	title="点击朗读，双击分析语法，长按录音，右键录音菜单"
	role="button"
	aria-label="单词 {word.word}，点击朗读，双击分析语法，长按录音，右键录音菜单"
	on:keydown={(e) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			speakWord();
		}
	}}
>
	<div class="phonetic text-xs text-gray-500 text-center mb-1">
		{word.phonetic}
	</div>
	<div class="original text-lg font-medium text-center">
		{word.word}
		{#if isAnalyzing}
			<span class="loading-dot">...</span>
		{/if}
	</div>
	<div class="translation text-xs text-gray-600 text-center mt-1">
		{word.translation}
	</div>
</button>

<!-- 语法分析模态框 -->
{#if showGrammarModal && grammarAnalysis}
	<div class="modal-overlay" role="dialog" aria-modal="true" on:click={closeModal}>
		<div class="modal-content" on:click|stopPropagation>
			<div class="modal-header">
				<h3 class="text-lg font-semibold">语法分析: {word.word}</h3>
				<button class="close-btn" on:click={closeModal} aria-label="关闭">×</button>
			</div>
			<div class="modal-body">
				{#if grammarAnalysis.partOfSpeech}
					<div class="mb-4">
						<h4 class="text-sm font-medium text-gray-700 mb-2">词性</h4>
						<p class="text-sm bg-blue-50 p-2 rounded">{grammarAnalysis.partOfSpeech}</p>
					</div>
				{/if}
				{#if grammarAnalysis.grammarRules && grammarAnalysis.grammarRules.length > 0}
					<div class="mb-4">
						<div class="space-y-2">
							{#each grammarAnalysis.grammarRules as rule}
								<div class="bg-gray-50 p-3 rounded">
									<p class="text-sm font-medium">{rule.rule}</p>
									<p class="text-xs text-gray-600 mt-1">{rule.description}</p>
								</div>
							{/each}
						</div>
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}

<!-- 录音菜单 -->
<RecordingMenu 
	{lyricId}
	word={word.word}
	isVisible={showRecordingMenu}
	position={menuPosition}
	on:close={closeRecordingMenu}
/>

<style>
	.word-unit {
		min-width: 60px;
		cursor: pointer;
		transition: all 0.2s ease;
		padding: 0.5rem;
		border-radius: 0.5rem;
		border: none;
		background: none;
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

	.loading-dot {
		animation: pulse 1.5s infinite;
	}

	@keyframes pulse {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.5; }
	}

	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
	}

	.modal-content {
		background: white;
		border-radius: 0.5rem;
		max-width: 500px;
		width: 90%;
		max-height: 80vh;
		overflow-y: auto;
		box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem;
		border-bottom: 1px solid #e5e7eb;
	}

	.close-btn {
		background: none;
		border: none;
		font-size: 1.5rem;
		cursor: pointer;
		color: #6b7280;
		padding: 0.25rem;
	}

	.close-btn:hover {
		color: #374151;
	}

	.modal-body {
		padding: 1rem;
	}
</style> 