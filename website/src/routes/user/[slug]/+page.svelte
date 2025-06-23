<script>
	import SwayWindow from "$lib/SwayWindow.svelte";
	import { possessiveForm } from "$lib/i18n/names.js";

	import { page } from "$app/stores";
	import { locale, _ } from "svelte-i18n";

	let username = $_("general.unknown");
	const windowTitle = () => {
		if ($page.data.code.split('.')[0] != "error") {
			username = $page.data.data.profile.username;
			if ($page.data.data?.profile.uid == $page.data.auth_info.profile?.uid)
				return $_("general.user_tracks");
		}
		return $_("general.tracks", { values: { username: possessiveForm(username) }});
	}
</script>

{#key $page.params.slug}
	<SwayWindow title={windowTitle()}>
	</SwayWindow>
{/key}
