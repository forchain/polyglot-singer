<script lang="ts">
	import { SUPPORTED_LANGUAGES } from '$lib/types/lyric.js';
	
	export let value = 'en';
	
	function handleChange(event: Event) {
		const target = event.target as HTMLSelectElement;
		value = target.value;
	}
</script>

<select 
	{value} 
	on:change={handleChange} 
	class="form-select"
>
	{#each SUPPORTED_LANGUAGES as lang}
		<option value={lang.code}>
			{lang.flag} {lang.name} ({lang.nativeName})
		</option>
	{/each}
</select> 