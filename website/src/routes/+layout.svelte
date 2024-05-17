<script>
	import { page } from "$app/stores";
	import SwayWindow from "$lib/SwayWindow.svelte";
</script>

<SwayWindow title="years" title_alt="recorded years" style="max-width: 300px; min-width: 300px">
	{#each $page.data.years as year}
		<a href="/year/{year}">
		{#if $page.params.slug == year} <!-- これめっちゃええやん -->
			<h4 style="background-color: var(--accent); border-color: var(--accent)">{year}</h4>
		{:else}
			<h4>{year}</h4>
		{/if}
		</a>
	{/each}
</SwayWindow>

<slot />

<style>
	h4 {
		border: 1px solid var(--unfocused_border);
		background-color: #111111;
		text-align: center;
		padding: 6px;
		margin-bottom: 10px;
		font-size: 14pt;
	}
	h4:hover {
		background-color: var(--unfocused_background);
		border-color: var(--unfocused_background);
	}
</style>
