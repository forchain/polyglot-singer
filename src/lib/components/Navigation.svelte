<script lang="ts">
	import { goto } from '$app/navigation';
	import type { User } from '$lib/types/user.js';
	
	export let user: User | null = null;
	export let currentPath: string = '/';
	
	let showMobileMenu = false;
	let showUserMenu = false;
	
	function toggleMobileMenu() {
		showMobileMenu = !showMobileMenu;
	}
	
	function toggleUserMenu() {
		showUserMenu = !showUserMenu;
	}
	
	function handleSignOut() {
		goto('/auth/signout');
	}
	
	// Close menus when clicking outside
	function handleClickOutside(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (!target.closest('.user-menu-container')) {
			showUserMenu = false;
		}
		if (!target.closest('.mobile-menu-container')) {
			showMobileMenu = false;
		}
	}
</script>

<svelte:window on:click={handleClickOutside} />

<nav class="bg-white shadow-sm border-b border-gray-200">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="flex h-16 justify-between items-center">
			<!-- Logo -->
			<div class="flex items-center">
				<a href="/" class="flex items-center space-x-2">
					<span class="text-2xl">🎵</span>
					<span class="text-xl font-bold text-gray-900">Polyglot Singer</span>
				</a>
			</div>

			<!-- Desktop Navigation -->
			<div class="hidden md:flex items-center space-x-8">
				<a 
					href="/" 
					class="text-gray-600 hover:text-gray-900 transition-colors duration-200"
					class:text-primary-600={currentPath === '/'}
					class:font-semibold={currentPath === '/'}
				>
					Home
				</a>
				
				{#if user}
					<a 
						href="/analyze" 
						class="text-gray-600 hover:text-gray-900 transition-colors duration-200"
						class:text-primary-600={currentPath === '/analyze'}
						class:font-semibold={currentPath === '/analyze'}
					>
						Analyze
					</a>
					<a 
						href="/library" 
						class="text-gray-600 hover:text-gray-900 transition-colors duration-200"
						class:text-primary-600={currentPath === '/library'}
						class:font-semibold={currentPath === '/library'}
					>
						My Library
					</a>
				{/if}
				
				<a 
					href="/demo" 
					class="text-gray-600 hover:text-gray-900 transition-colors duration-200"
					class:text-primary-600={currentPath === '/demo'}
					class:font-semibold={currentPath === '/demo'}
				>
					Demo
				</a>
			</div>

			<!-- User Menu / Auth Buttons -->
			<div class="hidden md:flex items-center space-x-4">
				{#if user}
					<div class="relative user-menu-container">
						<button
							on:click={toggleUserMenu}
							class="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 rounded-full py-2 px-4 transition-colors duration-200"
						>
							<div class="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
								{user.name.charAt(0).toUpperCase()}
							</div>
							<span class="text-gray-700 font-medium">{user.name}</span>
							<svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
							</svg>
						</button>
						
						{#if showUserMenu}
							<div class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-2 z-50">
								<a href="/profile" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profile</a>
								<a href="/settings" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Settings</a>
								<hr class="my-1">
								<button 
									on:click={handleSignOut}
									class="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
								>
									Sign Out
								</button>
							</div>
						{/if}
					</div>
				{:else}
					<a 
						href="/login" 
						class="text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200"
					>
						Sign In
					</a>
					<a 
						href="/register" 
						class="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
					>
						Get Started
					</a>
				{/if}
			</div>

			<!-- Mobile menu button -->
			<div class="md:hidden mobile-menu-container">
				<button
					on:click={toggleMobileMenu}
					class="text-gray-600 hover:text-gray-900 focus:outline-none"
				>
					<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						{#if showMobileMenu}
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
						{:else}
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
						{/if}
					</svg>
				</button>
			</div>
		</div>

		<!-- Mobile Navigation -->
		{#if showMobileMenu}
			<div class="md:hidden py-4 border-t border-gray-200">
				<div class="space-y-3">
					<a href="/" class="block text-gray-600 hover:text-gray-900 font-medium">Home</a>
					
					{#if user}
						<a href="/analyze" class="block text-gray-600 hover:text-gray-900 font-medium">Analyze</a>
						<a href="/library" class="block text-gray-600 hover:text-gray-900 font-medium">My Library</a>
						<a href="/profile" class="block text-gray-600 hover:text-gray-900 font-medium">Profile</a>
						<a href="/settings" class="block text-gray-600 hover:text-gray-900 font-medium">Settings</a>
						<button 
							on:click={handleSignOut}
							class="block w-full text-left text-gray-600 hover:text-gray-900 font-medium"
						>
							Sign Out
						</button>
					{:else}
						<a href="/demo" class="block text-gray-600 hover:text-gray-900 font-medium">Demo</a>
						<a href="/login" class="block text-gray-600 hover:text-gray-900 font-medium">Sign In</a>
						<a href="/register" class="block bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg inline-block">Get Started</a>
					{/if}
				</div>
			</div>
		{/if}
	</div>
</nav> 