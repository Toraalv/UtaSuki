<script>
	import { page } from "$app/stores";
	import SwayWindow from "$lib/SwayWindow.svelte";
	import Alert from "$lib/Alert.svelte";
</script>

<SwayWindow title="years" altTitle="recorded years" mainStyle="max-width: 300px; min-width: 300px">
	{#if $page.data.years.error}
		<Alert severity="{$page.data.years.error.severity}" code="{$page.data.years.error.code}" />
	{:else}
		{#each $page.data.years as year}
			<a href="/year/{year}">
			{#if $page.params.slug == year} <!-- これめっちゃええやん -->
				<h4 style="background-color: var(--accent); border-color: var(--accent)">{year}</h4>
			{:else}
				<h4>{year}</h4>
			{/if}
			</a>
		{/each}
	{/if}
</SwayWindow>

<slot />

<style>
	h4 {
		background-color: #111111;
		text-align: center;
		padding: 6px;
		margin-bottom: 10px;
		font-size: 14pt;
	}
	h4:hover {
		background-color: var(--unfocused_background);
	}
</style>
