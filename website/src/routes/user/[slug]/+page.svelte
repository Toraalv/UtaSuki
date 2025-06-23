<script>
	import SwayWindow from "$lib/SwayWindow.svelte";
	import { possessiveForm } from "$lib/i18n/names.js";

	import { page } from "$app/stores";
	import { locale, _ } from "svelte-i18n";

	let username = $derived($page.data.code.split('.')[0] != "error" ? $page.data.data.profile.username : $_("general.unknown"));
</script>

<SwayWindow title={$page.data.data.profile.uid == $page.data.auth_info.profile.uid ? $_("general.user_tracks") : $_("general.tracks", { values: { username: possessiveForm(username) }})}>
</SwayWindow>
