<script>
	import SwayWindow from "$lib/SwayWindow.svelte";
	import Alert from "$lib/Alert.svelte";
	import TrackContainer from "$lib/TrackContainer.svelte";
	import MonthContainer from "$lib/MonthContainer.svelte";
	import { possessiveForm } from "$lib/i18n/names.js";

	import { page } from "$app/stores";
	import { locale, _ } from "svelte-i18n";

	let username = $state(decodeURIComponent($page.url.pathname).split('/')[1]);
</script>

<SwayWindow title={$_("general.tracks", { values: { username: possessiveForm(username) }})} id="sway_window_tracks">
	{#if $page.data.trackRes.error}
		<Alert severity={$page.data.trackRes.error.severity} code={$page.data.trackRes.error.code}/>
	{:else}
		{#each $page.data.trackRes.data as month, i}
			{#if month.length}
				<MonthContainer date={$_(`months.${i}`)}>
					{#each month as track}
						<TrackContainer artist={track.artist}
										album={track.album}
										title={track.title}
										image={track.image}
										notes={track.notes}/>
					{/each}
				</MonthContainer>
			{/if}
		{/each}
	{/if}
</SwayWindow>
