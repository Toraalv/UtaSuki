<script>
	import SwayWindow from "$lib/SwayWindow.svelte";
	import Alert from "$lib/Alert.svelte";
	import TrackContainer from "$lib/TrackContainer.svelte";
	import MonthContainer from "$lib/MonthContainer.svelte";
	import { possessiveForm } from "$lib/i18n/names.js";

	import { page } from "$app/stores";
	import { locale, _ } from "svelte-i18n";
	import { tick } from "svelte";

	let username = $_("general.unknown");
	const windowTitle = () => {
		if ($page.data.code.split('.')[0] != "error") {
			username = $page.data.data.profile.username;
			if ($page.data.data?.profile.uid == $page.data.auth_info.profile?.uid)
				return $_("general.user_tracks");
		}
		return $_("general.tracks", { values: { username: possessiveForm(username) }});
	}

	// this fixes scrolling to top when deleting a track
	let slug = $state($page.params.slug);
	let slugChange = $derived(slug != $page.params.slug);
	let content = $state();
	$effect.pre(() => {
		slugChange;
		tick().then(() => {
			content.scrollTop = 0;
			slug = $page.params.slug;
			slugChange = false;
		});
	});
</script>

<SwayWindow contentStyle="flex: 1 0 0;" bind:content={content} title={windowTitle()}>
	{#if $page.data.tracks.code.split('.')[0] != "success"}
		<Alert code={$page.data.tracks.code}/>
	{:else}
		{#key $page.data.tracks}
			{#each $page.data.tracks.data as month, i}
				{#if month.length}
					<MonthContainer date={$_(`months.${i}`)}>
						{#each month as track, j}
							<TrackContainer
								id={track.id}
								date={track.date}
								artist={track.artist}
								album={track.album}
								title={track.title}
								image={track.image}
								imageVer={track.image_ver}
								notes={track.notes}
								isOwner={$page.data.auth_info.authed && $page.data.data.profile.uid == $page.data.auth_info.profile.uid}
								tabindex={`${i * 10000 + ((j + 1) * 100)}`}
							/>
						{/each}
					</MonthContainer>
				{/if}
			{/each}
		{/key}
	{/if}
</SwayWindow>
