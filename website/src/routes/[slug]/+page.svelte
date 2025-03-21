<script>
	import SwayWindow from "$lib/SwayWindow.svelte";
	import { possessiveForm } from "$lib/i18n/names.js";

	import { page } from "$app/stores";
	import { locale, _ } from "svelte-i18n";

	let username = $derived(decodeURIComponent($page.url.pathname).split('/')[1]);
</script>

<SwayWindow title={$_("general.tracks", { values: { username: possessiveForm(username) }})} id="sway_window_tracks">
</SwayWindow>
