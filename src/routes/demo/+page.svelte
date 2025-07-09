<script lang="ts">
	import LyricDisplay from '$lib/components/LyricDisplay.svelte';
	import type { LyricAnalysis } from '$lib/types/lyric.js';
	import { onMount } from 'svelte';

	// Sample demo data showing how the analysis would look
	const demoAnalysisEn: LyricAnalysis = {
		title: 'Imagine',
		artist: 'John Lennon',
		sourceLanguage: 'en',
		targetLanguage: 'zh',
		lines: [
			{
				originalLine: "Imagine there's no heaven",
				lineNumber: 1,
				words: [
					{
						word: "Imagine",
						phonetic: "/ɪˈmædʒɪn/",
						translation: "想象",
						context: "to form a mental image of something",
						position: { line: 1, index: 0 }
					},
					{
						word: "there's",
						phonetic: "/ðeərz/",
						translation: "有",
						context: "there is (contraction)",
						position: { line: 1, index: 1 }
					},
					{
						word: "no",
						phonetic: "/noʊ/",
						translation: "没有",
						context: "not any; not one",
						position: { line: 1, index: 2 }
					},
					{
						word: "heaven",
						phonetic: "/ˈhevən/",
						translation: "天堂",
						context: "the abode of God and the angels",
						position: { line: 1, index: 3 }
					}
				]
			},
			{
				originalLine: "It's easy if you try",
				lineNumber: 2,
				words: [
					{
						word: "It's",
						phonetic: "/ɪts/",
						translation: "这是",
						context: "it is (contraction)",
						position: { line: 2, index: 0 }
					},
					{
						word: "easy",
						phonetic: "/ˈizi/",
						translation: "容易的",
						context: "not difficult; simple",
						position: { line: 2, index: 1 }
					},
					{
						word: "if",
						phonetic: "/ɪf/",
						translation: "如果",
						context: "on the condition that",
						position: { line: 2, index: 2 }
					},
					{
						word: "you",
						phonetic: "/ju/",
						translation: "你",
						context: "the person being addressed",
						position: { line: 2, index: 3 }
					},
					{
						word: "try",
						phonetic: "/traɪ/",
						translation: "尝试",
						context: "to make an attempt or effort",
						position: { line: 2, index: 4 }
					}
				]
			},
			{
				originalLine: "No hell below us",
				lineNumber: 3,
				words: [
					{
						word: "No",
						phonetic: "/noʊ/",
						translation: "没有",
						context: "not any; not one",
						position: { line: 3, index: 0 }
					},
					{
						word: "hell",
						phonetic: "/hel/",
						translation: "地狱",
						context: "the place of punishment in the afterlife",
						position: { line: 3, index: 1 }
					},
					{
						word: "below",
						phonetic: "/bɪˈloʊ/",
						translation: "在下面",
						context: "at a lower level than",
						position: { line: 3, index: 2 }
					},
					{
						word: "us",
						phonetic: "/ʌs/",
						translation: "我们",
						context: "me and other people",
						position: { line: 3, index: 3 }
					}
				]
			},
			{
				originalLine: "Above us only sky",
				lineNumber: 4,
				words: [
					{
						word: "Above",
						phonetic: "/əˈbʌv/",
						translation: "在上面",
						context: "at a higher level than",
						position: { line: 4, index: 0 }
					},
					{
						word: "us",
						phonetic: "/ʌs/",
						translation: "我们",
						context: "me and other people",
						position: { line: 4, index: 1 }
					},
					{
						word: "only",
						phonetic: "/ˈoʊnli/",
						translation: "只有",
						context: "and nothing more",
						position: { line: 4, index: 2 }
					},
					{
						word: "sky",
						phonetic: "/skaɪ/",
						translation: "天空",
						context: "the space above the earth",
						position: { line: 4, index: 3 }
					}
				]
			}
		],
		metadata: {
			processingTime: 2.3,
			model: 'gpt-4',
			timestamp: new Date()
		}
	};

	// Japanese sample demo data
	const demoAnalysisJa: LyricAnalysis = {
		title: 'End Roll',
		artist: '滨崎步',
		sourceLanguage: 'ja',
		targetLanguage: 'zh',
		lines: [
			{
				originalLine: "君はどこにいるの",
				lineNumber: 1,
				words: [
					{
						word: "君",
						phonetic: "/kimiɕ/",
						translation: "你",
						context: "you (intimate form)",
						position: { line: 1, index: 0 }
					},
					{
						word: "は",
						phonetic: "/wa/",
						translation: "是",
						context: "topic marker particle",
						position: { line: 1, index: 1 }
					},
					{
						word: "どこ",
						phonetic: "/doko/",
						translation: "哪里",
						context: "where, what place",
						position: { line: 1, index: 2 }
					},
					{
						word: "に",
						phonetic: "/ni/",
						translation: "在",
						context: "location particle",
						position: { line: 1, index: 3 }
					},
					{
						word: "いる",
						phonetic: "/iru/",
						translation: "存在",
						context: "to exist, to be (animate)",
						position: { line: 1, index: 4 }
					},
					{
						word: "の",
						phonetic: "/no/",
						translation: "呢",
						context: "question particle",
						position: { line: 1, index: 5 }
					}
				]
			},
			{
				originalLine: "君はどこへ行ったのか",
				lineNumber: 2,
				words: [
					{
						word: "君",
						phonetic: "/kimiɕ/",
						translation: "你",
						context: "you (intimate form)",
						position: { line: 2, index: 0 }
					},
					{
						word: "は",
						phonetic: "/wa/",
						translation: "是",
						context: "topic marker particle",
						position: { line: 2, index: 1 }
					},
					{
						word: "どこ",
						phonetic: "/doko/",
						translation: "哪里",
						context: "where, what place",
						position: { line: 2, index: 2 }
					},
					{
						word: "へ",
						phonetic: "/e/",
						translation: "向",
						context: "direction particle",
						position: { line: 2, index: 3 }
					},
					{
						word: "行った",
						phonetic: "/itta/",
						translation: "去了",
						context: "went (past tense of iku)",
						position: { line: 2, index: 4 }
					},
					{
						word: "のか",
						phonetic: "/noka/",
						translation: "呢",
						context: "question particle (wondering)",
						position: { line: 2, index: 5 }
					}
				]
			},
			{
				originalLine: "遠い旅にでも出たんだね",
				lineNumber: 3,
				words: [
					{
						word: "遠い",
						phonetic: "/toːi/",
						translation: "遥远的",
						context: "far, distant",
						position: { line: 3, index: 0 }
					},
					{
						word: "旅",
						phonetic: "/tabiɕ/",
						translation: "旅行",
						context: "journey, trip",
						position: { line: 3, index: 1 }
					},
					{
						word: "に",
						phonetic: "/ni/",
						translation: "去",
						context: "direction particle",
						position: { line: 3, index: 2 }
					},
					{
						word: "でも",
						phonetic: "/demo/",
						translation: "也许",
						context: "even, or something",
						position: { line: 3, index: 3 }
					},
					{
						word: "出た",
						phonetic: "/deta/",
						translation: "出发了",
						context: "departed, set out",
						position: { line: 3, index: 4 }
					},
					{
						word: "んだ",
						phonetic: "/nda/",
						translation: "",
						context: "explanatory particle",
						position: { line: 3, index: 5 }
					},
					{
						word: "ね",
						phonetic: "/ne/",
						translation: "呢",
						context: "seeking agreement particle",
						position: { line: 3, index: 6 }
					}
				]
			},
			{
				originalLine: "一番大切な人と",
				lineNumber: 4,
				words: [
					{
						word: "一番",
						phonetic: "/iʧiban/",
						translation: "最",
						context: "most, number one",
						position: { line: 4, index: 0 }
					},
					{
						word: "大切",
						phonetic: "/taisetsu/",
						translation: "重要",
						context: "important, precious",
						position: { line: 4, index: 1 }
					},
					{
						word: "な",
						phonetic: "/na/",
						translation: "的",
						context: "adjectival particle",
						position: { line: 4, index: 2 }
					},
					{
						word: "人",
						phonetic: "/ɕito/",
						translation: "人",
						context: "person",
						position: { line: 4, index: 3 }
					},
					{
						word: "と",
						phonetic: "/to/",
						translation: "和",
						context: "with, together",
						position: { line: 4, index: 4 }
					}
				]
			}
		],
		metadata: {
			processingTime: 1.8,
			model: 'gpt-4',
			timestamp: new Date()
		}
	};

	// Current demo selection
	let currentDemo = 'english';
	const demos = {
		english: demoAnalysisEn,
		japanese: demoAnalysisJa
	};

	$: currentAnalysis = demos[currentDemo as keyof typeof demos];

	let gallery = [];
	let loading = true;
	let error = '';

	async function fetchGallery() {
		loading = true;
		error = '';
		try {
			const res = await fetch('/api/gallery');
			const data = await res.json();
			if (data.success) {
				gallery = data.data;
			} else {
				error = data.error || '获取展览馆数据失败';
			}
		} catch (e) {
			error = '网络错误，无法获取展览馆数据';
		} finally {
			loading = false;
		}
	}

	onMount(fetchGallery);
</script>

<svelte:head>
	<title>展览馆 - Polyglot Singer</title>
	<meta name="description" content="See how Polyglot Singer transforms song lyrics into interactive language learning experiences with AI-powered analysis." />
</svelte:head>

<div class="max-w-5xl mx-auto py-8">
	<h1 class="text-4xl font-bold text-center mb-8">🎨 展览馆</h1>
	{#if loading}
		<div class="text-center">加载中...</div>
	{:else if error}
		<div class="text-center text-red-500">{error}</div>
	{:else if gallery.length === 0}
		<div class="text-center text-gray-500">暂无公开作品</div>
	{:else}
		<div class="mb-8">
			<h2 class="text-2xl font-bold mb-4">功能特性</h2>
			<div class="grid md:grid-cols-2 gap-6">
				<div class="p-6 border rounded-lg bg-white shadow-sm">
					<h3 class="text-lg font-semibold mb-3">🎵 歌词分析</h3>
					<p class="text-gray-600 mb-4">支持多语言歌词的智能分析，提供逐词翻译和音标标注。</p>
					<ul class="text-sm text-gray-600 space-y-1">
						<li>• 支持10+种语言</li>
						<li>• 逐词翻译和音标</li>
						<li>• 上下文语义分析</li>
						<li>• 智能语言检测</li>
					</ul>
				</div>
				
				<div class="p-6 border rounded-lg bg-white shadow-sm">
					<h3 class="text-lg font-semibold mb-3">🔤 语法分析</h3>
					<p class="text-gray-600 mb-4">双击单词即可获得详细的语法分析，包括词性、语法规则和例句。</p>
					<ul class="text-sm text-gray-600 space-y-1">
						<li>• 双击单词触发分析</li>
						<li>• 多层缓存机制</li>
						<li>• 词性和语法规则</li>
						<li>• 实用例句展示</li>
					</ul>
				</div>

				<div class="p-6 border rounded-lg bg-white shadow-sm">
					<h3 class="text-lg font-semibold mb-3">🎤 语音朗读</h3>
					<p class="text-gray-600 mb-4">点击单词即可听到标准发音，支持多种语音选择。</p>
					<ul class="text-sm text-gray-600 space-y-1">
						<li>• 标准发音朗读</li>
						<li>• 多种语音选择</li>
						<li>• 实时语音合成</li>
						<li>• 语音速度调节</li>
					</ul>
				</div>

				<div class="p-6 border rounded-lg bg-white shadow-sm">
					<h3 class="text-lg font-semibold mb-3">📚 学习管理</h3>
					<p class="text-gray-600 mb-4">管理你的学习进度，跟踪掌握情况，个性化学习体验。</p>
					<ul class="text-sm text-gray-600 space-y-1">
						<li>• 学习进度跟踪</li>
						<li>• 个人词库管理</li>
						<li>• 复习提醒功能</li>
						<li>• 学习数据统计</li>
					</ul>
				</div>
			</div>
		</div>
		<div class="grid md:grid-cols-2 gap-6">
			{#each gallery as item}
				<div class="p-6 border rounded-lg bg-white shadow-sm flex flex-col justify-between">
					<div>
						<div class="text-lg font-semibold mb-1">{item.title || '未命名'}</div>
						<div class="text-xs text-gray-500 mb-2">{item.artist || '未知歌手'} · {item.createdAt?.slice(0, 10) || ''}</div>
						<div class="text-sm text-gray-700 mb-2 truncate">{item.lyrics}</div>
					</div>
					<a href={`/analyze/history/${item.id}`} class="mt-2 text-blue-600 hover:underline text-sm">查看详情</a>
				</div>
			{/each}
		</div>
	{/if}
</div> 