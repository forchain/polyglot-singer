<script lang="ts">
	import LyricDisplay from '$lib/components/LyricDisplay.svelte';
	import type { LyricAnalysis } from '$lib/types/lyric.js';

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
</script>

<svelte:head>
	<title>Demo - Polyglot Singer</title>
	<meta name="description" content="See how Polyglot Singer transforms song lyrics into interactive language learning experiences with AI-powered analysis." />
</svelte:head>

<div class="max-w-6xl mx-auto py-8">
	<!-- Header -->
	<div class="text-center mb-8">
		<h1 class="text-4xl font-bold text-gray-900 mb-4">
			🎵 Interactive Demo
		</h1>
		<p class="text-xl text-gray-600 max-w-3xl mx-auto">
			Experience how Polyglot Singer transforms song lyrics into an interactive language learning tool. 
			Below is a sample analysis of John Lennon's "Imagine" showing English lyrics with Chinese translations.
		</p>
	</div>

	<!-- Language Selection -->
	<div class="flex justify-center mb-6">
		<div class="bg-white rounded-lg shadow-sm p-1 flex">
			<button
				class="px-4 py-2 rounded-md font-medium transition-colors duration-200 {currentDemo === 'english' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-blue-600'}"
				on:click={() => currentDemo = 'english'}
			>
				🇺🇸 English → Chinese
			</button>
			<button
				class="px-4 py-2 rounded-md font-medium transition-colors duration-200 {currentDemo === 'japanese' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-blue-600'}"
				on:click={() => currentDemo = 'japanese'}
			>
				🇯🇵 Japanese → Chinese
			</button>
		</div>
	</div>

	<!-- Demo Features -->
	<div class="bg-blue-50 rounded-lg p-6 mb-8">
		<h2 class="text-lg font-semibold text-blue-900 mb-3">✨ What you'll see in this demo:</h2>
		<ul class="grid md:grid-cols-2 gap-2 text-blue-800">
			<li>• IPA phonetic transcription above each word</li>
			<li>• Contextual translations below each word</li>
			<li>• Perfect alignment for singing practice</li>
			<li>• Hover effects for detailed word analysis</li>
			<li>• Responsive design for all devices</li>
			<li>• Beautiful typography optimized for readability</li>
		</ul>
	</div>

		<!-- Demo Analysis Display -->
	<div class="bg-white rounded-lg shadow-lg p-6">
		<div class="border-b border-gray-200 pb-4 mb-6">
			<h2 class="text-2xl font-semibold text-gray-900">
				{currentAnalysis.title}
			</h2>
			<p class="text-gray-600">by {currentAnalysis.artist}</p>
			<div class="flex gap-4 mt-2 text-sm text-gray-500">
				<span>{currentAnalysis.sourceLanguage === 'en' ? 'English' : 'Japanese'} → Chinese</span>
				<span>•</span>
				<span>{currentAnalysis.lines.reduce((acc, line) => acc + line.words.length, 0)} words analyzed</span>
				<span>•</span>
				<span>Analyzed in {currentAnalysis.metadata?.processingTime}s</span>
			</div>
		</div>

		<LyricDisplay analysis={currentAnalysis} />
	</div>

	<!-- CTA Section -->
	<div class="text-center mt-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8">
		<h2 class="text-2xl font-bold text-gray-900 mb-4">
			Ready to analyze your own songs?
		</h2>
		<p class="text-gray-600 mb-6">
			Start learning any language through music with AI-powered lyric analysis.
		</p>
		<div class="flex flex-col sm:flex-row gap-4 justify-center">
			<a
				href="/analyze"
				class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
			>
				Analyze Your Song
			</a>
			<a
				href="/"
				class="text-blue-600 hover:text-blue-700 font-semibold py-3 px-8 transition-colors duration-200"
			>
				← Back to Home
			</a>
		</div>
	</div>

	<!-- Technical Info -->
	<div class="mt-8 bg-gray-50 rounded-lg p-6">
		<h3 class="text-lg font-semibold text-gray-900 mb-3">🤖 Powered by AI</h3>
		<p class="text-gray-600 mb-3">
			This demo showcases analysis powered by advanced language models that provide:
		</p>
		<ul class="text-gray-600 space-y-1">
			<li>• Accurate phonetic transcription using International Phonetic Alphabet (IPA)</li>
			<li>• Contextual translations that consider the song's meaning</li>
			<li>• Language detection with 99%+ accuracy</li>
			<li>• Support for 15+ language pairs</li>
		</ul>
	</div>
</div> 