<script>
	import SwayWindow from "$lib/SwayWindow.svelte";
	import data from "$lib/Tracks.json";
</script>

<SwayWindow title="tracks" title_alt="tracks for the year">
	{#each data as item}
		{#each item.tracks as track}
			<h5>{track.trackname}</h5>
		{/each}
	{/each}
</SwayWindow>
