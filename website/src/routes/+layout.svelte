<script>
	import { page } from "$app/stores";
	import SwayWindow from "$lib/SwayWindow.svelte";
	import json_tracks from "$lib/Tracks.json";
</script>

<SwayWindow title="years" title_alt="recorded years" style="max-width: 300px">
	{#each $page.data.years as year}
		<h4>{year}</h4>
	{/each}
</SwayWindow>

<slot />

<style>
</style>
