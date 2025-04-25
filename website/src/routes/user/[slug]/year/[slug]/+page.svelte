<script>
	import SwayWindow from "$lib/SwayWindow.svelte";
	import Alert from "$lib/Alert.svelte";
	import TrackContainer from "$lib/TrackContainer.svelte";
	import MonthContainer from "$lib/MonthContainer.svelte";
	import { possessiveForm } from "$lib/i18n/names.js";

	import { page } from "$app/stores";
	import { locale, _ } from "svelte-i18n";
	import { tick } from "svelte";

	let username = $derived($page.data.code.split('.')[0] != "error" ? $page.data.data.profile.username : $_("general.unknown"));

	let content = $state();
	$effect.pre(() => {
		$page.data.tracks;
		tick().then(() => {
			content.scrollTop = 0;
		});
	});
</script>

<SwayWindow bind:content={content} title={$_("general.tracks", { values: { username: possessiveForm(username) }})}>
	{#if $page.data.tracks.code.split('.')[0] != "success"}
		<Alert code={$page.data.tracks.code}/>
	{:else}
		{#each $page.data.tracks.data as month, i}
			{#if month.length}
				<MonthContainer date={$_(`months.${i}`)}>
					{#each month as track}
						<TrackContainer id={track.id}
										date={track.date}
										artist={track.artist}
										album={track.album}
										title={track.title}
										image={track.image}
										notes={track.notes}
										isOwner={$page.data.auth_info.authed && $page.data.data.profile.uid == $page.data.auth_info.profile.uid}/>
					{/each}
				</MonthContainer>
			{/if}
		{/each}
	{/if}
</SwayWindow>
