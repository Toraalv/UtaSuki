<script>
	import SwayWindow from "$lib/SwayWindow.svelte";
	import LinkButton from "$lib/LinkButton.svelte";
	import Alert from "$lib/Alert.svelte";
	import { CDN_ADDR } from "$lib/globals.js";

	import { page } from "$app/stores";
	import { _ } from "svelte-i18n";
	import { enhance } from "$app/forms";

	let { mainStyle = "" } = $props();
</script>

{#snippet authedControlPanel()}
	<SwayWindow title={$_("general.control_panel")} mainStyle={"max-width: 300px; min-width: 300px; flex: 1;" + mainStyle} contentStyle="display: flex; flex-direction: column; flex-grow: 1;">
		<fieldset>
			<legend>{$page.data.res.auth_info.profile.username}</legend>
			<img alt="profile" src={CDN_ADDR + $page.data.res.auth_info.profile.image}/>
		</fieldset>
		<LinkButton active={$page.url.pathname == "/"} href="/">{$_("general.home")}</LinkButton>
		<LinkButton active={$page.url.pathname == "/" + $page.data.res.auth_info.profile.username || $page.url.pathname.substring(1, $page.data.res.auth_info.profile.username.length + 1) == $page.data.res.auth_info.profile.username} href={"/" + $page.data.res.auth_info.profile.username}>{$_("general.user_tracks")}</LinkButton>
		<LinkButton active={$page.url.pathname == "/add"} href="/add">{$_("general.add_track")}</LinkButton>
		<form style="margin-top: auto" action="/?/logout" method="POST" use:enhance>
			<input type="submit" value="{$_("general.logout")}">
		</form>
	</SwayWindow>
{/snippet}

{#snippet authDewanaiControlPanel()}
<SwayWindow title={$_("general.control_panel")} mainStyle={"max-width: 300px; min-width: 300px; flex: 1;" + mainStyle} contentStyle="display: flex; flex-direction: column; flex-grow: 0;">
	{#if $page.data.res.error}
		<Alert mainStyle="margin-bottom: 5px;" severity={$page.data.res.error.severity} code={$page.data.res.error.code}/>
	{/if}
	<LinkButton active={$page.url.pathname == "/"} href="/">{$_("general.home")}</LinkButton>
</SwayWindow>
{/snippet}

{#if !$page.data.res.error}
	{#if $page.data.res.auth_info.authed}
		{@render authedControlPanel()}
	{:else}
		{@render authDewanaiControlPanel()}
	{/if}
{:else}
	{#if $page.data.res.error.severity == "info"}
		{@render authedControlPanel()}
	{:else}
		{@render authDewanaiControlPanel()}
	{/if}
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
