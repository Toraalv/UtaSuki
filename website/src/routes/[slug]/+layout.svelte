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


	// let username = $derived(decodeURIComponent($page.url.pathname).split('/')[1]); // this was a very good idea until username couldn't be used to seperate users
	let username = $derived(!$page.data.res.error ? $page.data.res.data.profile.username : $_("general.unknown"));
</script>

{#snippet yearList()}
	<SwayWindow title={$_("general.years")} mainStyle="max-width: 300px; min-width: 300px; flex-grow: 1;" contentStyle="display: flex; flex-direction: column; justify-content: space-between">
		{#if $page.data.res.code.split('.')[0] == "info"}
			<div>
				<Alert code={$page.data.res.code}/>
			</div>
		{:else}
			<div style="display: flex; flex-direction: column;">
				{#each $page.data.res.data.years as year}
					<LinkButton onclick={() => document.getElementById("sway_window_tracks").scrollTop = 0} href="/{$page.url.pathname.split("/")[1]}/{year}" active={$page.params.slug == year}>{year}</LinkButton> <!-- I really don't like this document.getElementById(...) but I have not succesfully implemented a solution using $effect.pre and tick() yet -->
				{/each}
			</div>
		{/if}
	</SwayWindow>
{/snippet}

<div style="display: flex; flex-direction: column; justify-content: space-between; height: 100vh; margin: 0; padding: 0;">
	<ControlPanel mainStyle="min-height: 50vh;"/>
	{#if !$page.data.res.error}
		{#if $page.data.res.auth_info.authed && $page.data.res.auth_info.profile.username == username}
			{@render yearList()}
		{/if}
	{/if}
	<Footer/>
</div>

{@render children?.()}

{#if $page.data.res.error}
	{#key $page.params.slug}
		<SwayWindow title={$_("general.profile", { values: { username: possessiveForm(username) }})} mainStyle="max-width: 300px; min-width: 300px; flex-grow: 1;" contentStyle="display: flex; flex-direction: column; justify-content: space-between">
			<div>
				<Alert code={$page.data.res.error.code}/>
			</div>
		</SwayWindow>
	{/key}
{:else}
	<div style="display: flex; flex-direction: column; justify-content: space-between; height: 100vh; margin: 0; padding: 0;">
		{#if $page.data.res.auth_info.authed && $page.data.res.auth_info.profile.username == username}
		{:else}
			<!-- pseudo user profile -->
			<SwayWindow title={$_("general.profile", { values: { username: possessiveForm(username) }})} mainStyle="max-width: 300px; min-width: 300px; flex-grow: 1;" contentStyle="display: flex; flex-direction: column; justify-content: space-between">
				<fieldset>
					<legend>{username}</legend>
					<img alt="profile" src={CDN_ADDR + $page.data.res.data.profile.image}/>
				</fieldset>
				<h3>stats:</h3>
				<p>total tracks: {$page.data.res.data.totalTracks}</p>
			</SwayWindow>
			<!-- /pseudo user profile -->
		{/if}
		{#if $page.data.res.auth_info.authed && $page.data.res.auth_info.profile.username == username}
		{:else}
			{@render yearList()}
		{/if}
	</div>
{/if}

<style>
	fieldset {
		border-color: var(--unfocused_border);
		margin: 0 0 5px 0;
	}
	legend {
		font-size: 16pt;
	}
	img {
		width: 100%;
		max-height: 450px;
	}
</style>
