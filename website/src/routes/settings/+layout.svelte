<script>
	import SwayWindow from "$lib/SwayWindow.svelte";
	import LinkButton from "$lib/LinkButton.svelte";
	import "$lib/i18n/index.js";

	import { page } from "$app/stores";
	import { _ } from "svelte-i18n";

	let { children } = $props();

	let currentSetting = $derived($page.route.id.split('/')[2]);
</script>

<div style="display: flex; flex: 1 0 0;">
	<SwayWindow title={$_("general.settings")} mainStyle="min-width: 300px; max-width: 300px; flex-grow: 1;" contentStyle="display: flex; flex: 1 0 0; flex-direction: column;">
		<LinkButton href="/settings/account" active={currentSetting == "account"}>{$_("settings.account")}</LinkButton>
		<LinkButton href="/settings/profile" active={currentSetting == "profile"}>{$_("settings.profile")}</LinkButton>
		<LinkButton href="/settings/appearance" active={currentSetting == "appearance"}>{$_("settings.appearance")}</LinkButton>
	</SwayWindow>

	<SwayWindow title={currentSetting && $_(`settings.${currentSetting}`)}>
		{@render children?.()}
	</SwayWindow>
</div>
