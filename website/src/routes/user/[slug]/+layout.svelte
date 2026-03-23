<script>
	import SwayWindow from "$lib/SwayWindow.svelte";
	import Alert from "$lib/Alert.svelte";
	import LinkButton from "$lib/LinkButton.svelte";
	import { possessiveForm } from "$lib/i18n/names.js";
	import { PFP_PATH } from "$lib/globals.js";

	import { page } from "$app/stores";
	import { locale, _ } from "svelte-i18n";

	let { children } = $props();

	let username = $_("general.unknown");
	const windowTitle = () => {
		if ($page.data.code.split('.')[0] != "error") {
			username = $page.data.data.profile.username;
			if ($page.data.data?.profile.uid == $page.data.auth_info.profile?.uid)
				return $_("general.self_profile");
		}
		return $_("general.profile", { values: { username: possessiveForm(username) }});
	}
</script>

{#snippet yearList()}
	<SwayWindow title={$_("general.years")} mainStyle="min-width: 300px; max-width: 300px; flex-grow: 1;" contentStyle="display: flex; flex: 1 0 0; flex-direction: column; justify-content: space-between">
		{#if $page.data.code.split('.')[0] == "info"}
			<div>
				<Alert code={($page.data.code === "info.user_no_tracks" && $page.data.data.profile.uid === $page.data.auth_info.profile?.uid) ? "info.self_no_tracks" : $page.data.code}/>
			</div>
		{:else}
			<div style="display: flex; flex-direction: column;">
				{#each $page.data.data.years as year}
					<LinkButton href="/user/{$page.url.pathname.split("/")[2]}/tracks/{year}" active={$page.params.slug == year}>{year}</LinkButton>
				{/each}
			</div>
		{/if}
	</SwayWindow>
{/snippet}

<div style="display: flex; justify-content: space-between; margin: 0; padding: 0; flex-grow: 1;">
	{#if $page.data.code.split('.')[0] == "error"}
		<SwayWindow title={windowTitle()} mainStyle="min-width: 300px; max-width: 300px; flex-grow: 1;" contentStyle="display: flex; flex-direction: column; justify-content: space-between">
			<div>
				<Alert code={$page.data.code}/>
			</div>
		</SwayWindow>
	{:else}
		<div style="display: flex; flex-direction: column; justify-content: space-between; margin: 0; padding: 0;">
			<a href="/user/{$page.url.pathname.split("/")[2]}">
				<SwayWindow title={windowTitle()} mainStyle="min-width: 300px; max-width: 300px; flex-grow: 0;" contentStyle="display: flex; flex-direction: column; justify-content: space-between">
					<img alt="profile" src={`${PFP_PATH}/${$page.data.data.profile.image}?${$page.data.data.profile.image_ver}`}/>
					<p>{$_("stats.tracks")}: {$page.data.data.totalTracks}</p>
				</SwayWindow>
			</a>
			{@render yearList()}
		</div>
	{/if}
	{#key $page.data.auth_info?.authed}
		{@render children?.()}
	{/key}
</div>

<style>
	img {
		width: 100%;
		max-height: 450px;
		border-radius: var(--border_radius);
	}
</style>
