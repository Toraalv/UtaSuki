<script>
	import { page } from "$app/stores";
	import { monthMap } from "$lib/helpers.js";
	import SwayWindow from "$lib/SwayWindow.svelte";
	import Alert from "$lib/Alert.svelte";
	import TrackContainer from "$lib/TrackContainer.svelte"
	import MonthContainer from "$lib/MonthContainer.svelte"
	import { afterUpdate } from "svelte";

	afterUpdate(() => {
		document.getElementById("sway_window_tracks").scrollTop = 0;
	});
</script>

<SwayWindow title="tracks" altTitle="tracks for the year" id="sway_window_tracks">
	{#if $page.data.monthTracks.error}
		<Alert severity="{$page.data.monthTracks.error.severity}" code="{$page.data.monthTracks.error.code}" />
	{:else}
		{#each $page.data.monthTracks as month, i}
			{#if month.length}
				<MonthContainer date={monthMap[i]}>
					{#each month as track}
						<TrackContainer artist={track.artist}
										album={track.album}
										title={track.title}
										released={track.released}
										image={track.image}
										description={track.description}
										lastEdit={track.last_edit}
						/>
					{/each}
				</MonthContainer>
			{/if}
		{/each}
	{/if}
</SwayWindow>
