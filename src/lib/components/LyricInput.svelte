<script lang="ts">
	export let value = '';
	export let placeholder = 'Enter song lyrics here...';
	export let maxLength = 10000;
	
	let textarea: HTMLTextAreaElement;
	
	// Auto-resize textarea
	function autoResize() {
		if (textarea) {
			textarea.style.height = 'auto';
			textarea.style.height = textarea.scrollHeight + 'px';
		}
	}
	
	// Handle input
	function handleInput(event: Event) {
		const target = event.target as HTMLTextAreaElement;
		value = target.value;
		autoResize();
	}
	
	// Calculate word count
	$: wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
	$: lineCount = value.split('\n').length;
	
	// Auto-resize when value changes externally
	$: if (textarea && value !== undefined) {
		autoResize();
	}
</script>

<div class="space-y-2">
	<textarea
		bind:this={textarea}
		{value}
		{placeholder}
		maxlength={maxLength}
		on:input={handleInput}
		class="form-textarea min-h-[200px] max-h-[500px]"
		rows="8"
	></textarea>
	
	<!-- Stats -->
	<div class="flex justify-between text-sm text-gray-500">
		<div class="space-x-4">
			<span>{wordCount} words</span>
			<span>{lineCount} lines</span>
		</div>
		<span>{value.length}/{maxLength} characters</span>
	</div>
	
	<!-- Tips -->
	{#if !value.trim()}
		<div class="text-sm text-gray-400 mt-2">
			💡 <strong>Tips:</strong> 
			Paste lyrics from your favorite songs. The AI works best with complete verses or choruses.
		</div>
	{/if}
</div> 