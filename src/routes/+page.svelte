<script lang="ts">
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';

	export let data: PageData;
	
	function handleGetStarted() {
		// Always go to analyze page for immediate experience
		goto('/analyze');
	}
</script>

<svelte:head>
	<title>Polyglot Singer - Learn Languages Through Music</title>
	<meta name="description" content="Transform language learning into an enjoyable musical experience with AI-powered lyric analysis and phonetic transcription." />
</svelte:head>

<!-- Hero Section -->
<section class="text-center py-16">
	<div class="max-w-4xl mx-auto">
		<h1 class="text-5xl font-bold text-gray-900 mb-6">
			🎵 Become a <span class="text-primary-600">Polyglot</span> by Singing Songs
		</h1>
		
		<p class="text-xl text-gray-600 mb-8 leading-relaxed">
			Transform language learning into an enjoyable musical experience. 
			Learn vocabulary through AI-powered lyric analysis with phonetic transcription and contextual translations.
		</p>
		
		<div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
			<button
				on:click={handleGetStarted}
				class="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 text-lg"
			>
				Start Analyzing Now
			</button>
			
			<a
				href="/demo"
				class="text-primary-600 hover:text-primary-700 font-semibold py-3 px-8 transition-colors duration-200 text-lg"
			>
				View Demo →
			</a>
		</div>
	</div>
</section>

<!-- Features Section -->
<section class="py-16 bg-white rounded-2xl shadow-sm">
	<div class="max-w-6xl mx-auto px-6">
		<h2 class="text-3xl font-bold text-center text-gray-900 mb-12">
			Why Learn Languages Through Music?
		</h2>
		
		<div class="grid md:grid-cols-3 gap-8">
			<div class="text-center">
				<div class="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
					<span class="text-2xl">🎤</span>
				</div>
				<h3 class="text-xl font-semibold text-gray-900 mb-3">Universal Appeal</h3>
				<p class="text-gray-600">
					Singing is accessible and enjoyable for everyone, making language learning feel natural and fun.
				</p>
			</div>
			
			<div class="text-center">
				<div class="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
					<span class="text-2xl">🧠</span>
				</div>
				<h3 class="text-xl font-semibold text-gray-900 mb-3">Memory Enhancement</h3>
				<p class="text-gray-600">
					Melodies help retain lyrics and vocabulary better than traditional memorization methods.
				</p>
			</div>
			
			<div class="text-center">
				<div class="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
					<span class="text-2xl">🔥</span>
				</div>
				<h3 class="text-xl font-semibold text-gray-900 mb-3">High Engagement</h3>
				<p class="text-gray-600">
					Entertainment value drives sustained learning motivation and longer practice sessions.
				</p>
			</div>
		</div>
	</div>
</section>

<!-- How It Works Section -->
<section class="py-16">
	<div class="max-w-4xl mx-auto">
		<h2 class="text-3xl font-bold text-center text-gray-900 mb-12">
			How Polyglot Singer Works
		</h2>
		
		<div class="space-y-8">
			<div class="flex items-start gap-6">
				<div class="bg-primary-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0 mt-1">
					1
				</div>
				<div>
					<h3 class="text-xl font-semibold text-gray-900 mb-2">Input Song Lyrics</h3>
					<p class="text-gray-600">
						Paste your favorite song lyrics in any language. Our AI automatically detects the source language.
					</p>
				</div>
			</div>
			
			<div class="flex items-start gap-6">
				<div class="bg-primary-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0 mt-1">
					2
				</div>
				<div>
					<h3 class="text-xl font-semibold text-gray-900 mb-2">AI-Powered Analysis</h3>
					<p class="text-gray-600">
						Our AI provides word-by-word translation, phonetic transcription, and contextual meaning within the song.
					</p>
				</div>
			</div>
			
			<div class="flex items-start gap-6">
				<div class="bg-primary-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0 mt-1">
					3
				</div>
				<div>
					<h3 class="text-xl font-semibold text-gray-900 mb-2">Perfect Alignment</h3>
					<p class="text-gray-600">
						See phonetic pronunciation above each word and contextual translation below, perfectly aligned for singing practice.
					</p>
				</div>
			</div>
			
			<div class="flex items-start gap-6">
				<div class="bg-primary-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0 mt-1">
					4
				</div>
				<div>
					<h3 class="text-xl font-semibold text-gray-900 mb-2">Practice & Learn</h3>
					<p class="text-gray-600">
						Sing along while learning vocabulary contextually. Save your progress and track your improvement over time.
					</p>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- CTA Section -->
<section class="py-16 bg-primary-50 rounded-2xl text-center">
	<div class="max-w-2xl mx-auto">
		<h2 class="text-3xl font-bold text-gray-900 mb-4">
			Ready to Start Your Musical Language Journey?
		</h2>
		<p class="text-gray-600 mb-8">
			Join thousands of learners who are discovering languages through the power of music.
		</p>
		<button
			on:click={handleGetStarted}
			class="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 text-lg"
		>
			Start Analyzing Now
		</button>
	</div>
</section> 