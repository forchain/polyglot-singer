<script lang="ts">
	import '../lib/styles/global.css';
	import Navigation from '$lib/components/Navigation.svelte';
	import { page } from '$app/stores';
	import type { LayoutData } from './$types';

	export let data: LayoutData;
	
	$: user = data.user;
</script>

<svelte:head>
	<title>Polyglot Singer - Learn Languages Through Music</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<Navigation {user} currentPath={$page.url.pathname} />
	
	<main class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
		<slot />
	</main>
	
	<!-- Footer -->
	<footer class="bg-white border-t border-gray-200 mt-16">
		<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
			<div class="text-center text-gray-600">
				<p>&copy; 2024 Polyglot Singer. Made with ❤️ for language learners and music lovers.</p>
			</div>
		</div>
	</footer>
</div> 