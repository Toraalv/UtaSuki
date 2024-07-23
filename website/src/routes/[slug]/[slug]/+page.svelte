<script>
	import { page } from "$app/stores";
	import SwayWindow from "$lib/SwayWindow.svelte";
	import Alert from "$lib/Alert.svelte";
	import TrackContainer from "$lib/TrackContainer.svelte"
	import MonthContainer from "$lib/MonthContainer.svelte"
	import { afterUpdate } from "svelte";
	import { _ } from "svelte-i18n";

	afterUpdate(() => {
		document.getElementById("sway_window_tracks").scrollTop = 0;
	});
</script>


<SwayWindow title="{$_('general.tracks')}" altTitle="{$_('general.tracks')}" id="sway_window_tracks">
	{#if $page.data.monthTracks.error}
		<Alert severity="{$page.data.monthTracks.error.severity}" code="{$page.data.monthTracks.error.code}" />
	{:else}
		{#each $page.data.monthTracks as month, i}
			{#if month.length}
				<MonthContainer date={$_(`months.${i}`)}>
					{#each month as track}
						<TrackContainer artist={track.artist}
										album={track.album}
										title={track.title}
										image={track.image}
										description={track.description}
						/>
					{/each}
				</MonthContainer>
			{/if}
		{/each}
	{/if}
</SwayWindow>
