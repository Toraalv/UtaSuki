<script>
	import { page } from "$app/stores";
	import { monthMap } from "$lib/helpers.js";
	import SwayWindow from "$lib/SwayWindow.svelte";
	import TrackContainer from "$lib/TrackContainer.svelte"
	import MonthContainer from "$lib/MonthContainer.svelte"
</script>

<SwayWindow title="tracks" title_alt="tracks for the year">
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
</SwayWindow>
