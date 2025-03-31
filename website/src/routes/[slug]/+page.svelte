<script>
	import SwayWindow from "$lib/SwayWindow.svelte";
	import { possessiveForm } from "$lib/i18n/names.js";

	import { page } from "$app/stores";
	import { locale, _ } from "svelte-i18n";

	let username = $derived($page.data.res.code.split('.')[0] != "error" ? $page.data.res.data.profile.username : $_("general.unknown"));
</script>

<SwayWindow title={$_("general.tracks", { values: { username: possessiveForm(username) }})} id="sway_window_tracks">
</SwayWindow>
