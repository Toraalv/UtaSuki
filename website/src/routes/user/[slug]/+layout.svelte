<script>
	import SwayWindow from "$lib/SwayWindow.svelte";
	import ControlPanel from "$lib/ControlPanel.svelte";
	import Footer from "$lib/Footer.svelte";
	import Alert from "$lib/Alert.svelte";
	import LinkButton from "$lib/LinkButton.svelte";
	import { possessiveForm } from "$lib/i18n/names.js";
	import { CDN_ADDR } from "$lib/globals.js";

	import { page } from "$app/stores";
	import { locale, _ } from "svelte-i18n";

	let { children } = $props();

	let username = $derived($page.data.code.split('.')[0] != "error" ? $page.data.data.profile.username : $_("general.unknown"));
</script>

{#snippet yearList()}
	<SwayWindow title={$_("general.years")} mainStyle="min-width: 300px; max-width: 300px; flex-grow: 0;" contentStyle="display: flex; flex-direction: column; justify-content: space-between">
		{#if $page.data.code.split('.')[0] == "info"}
			<div>
				<Alert code={$page.data.code}/>
			</div>
		{:else}
			<div style="display: flex; flex-direction: column;">
				{#each $page.data.data.years as year}
					<LinkButton href="/user/{$page.url.pathname.split("/")[2]}/year/{year}" active={$page.params.slug == year}>{year}</LinkButton>
				{/each}
			</div>
		{/if}
	</SwayWindow>
{/snippet}

<div style="display: flex; flex-direction: column; justify-content: space-between; height: 100vh; margin: 0; padding: 0;">
	<ControlPanel mainStyle="min-height: 50vh;"/>
	{#if $page.data.code.split('.')[0] != "error"}
		{#if $page.data.auth_info.authed && $page.data.auth_info.profile.username == username}
			{@render yearList()}
		{/if}
	{/if}
	<Footer/>
</div>

{@render children?.()}

{#if $page.data.code.split('.')[0] == "error"}
	{#key $page.params.slug}
		<SwayWindow title={$_("general.profile", { values: { username: possessiveForm(username) }})} mainStyle="min-width: 300px; max-width: 300px; flex-grow: 1;" contentStyle="display: flex; flex-direction: column; justify-content: space-between">
			<div>
				<Alert code={$page.data.code}/>
			</div>
		</SwayWindow>
	{/key}
{:else}
	<div style="display: flex; flex-direction: column; justify-content: space-between; height: 100vh; margin: 0; padding: 0;">
		{#if $page.data.auth_info.authed && $page.data.auth_info.profile.username == username}
		{:else}
			<SwayWindow title={$_("general.profile", { values: { username: possessiveForm(username) }})} mainStyle="min-width: 300px; max-width: 300px; flex-grow: 1;" contentStyle="display: flex; flex-direction: column; justify-content: space-between">
				<img alt="profile" src={CDN_ADDR + $page.data.data.profile.image + `?${$page.data.data.profile.image_ver}`}/>
				<h3 style:margin-top="10px">stats:</h3>
				<p>total tracks: {$page.data.data.totalTracks}</p>
			</SwayWindow>
		{/if}
		{#if $page.data.auth_info.authed && $page.data.auth_info.profile.username == username}
		{:else}
			{@render yearList()}
		{/if}
	</div>
{/if}

<style>
	img {
		width: 100%;
		max-height: 450px;
	}
</style>
