<script>
	import SwayWindow from "$lib/SwayWindow.svelte";
	import { possessiveForm } from "$lib/i18n/names.js";

	import { page } from "$app/stores";
	import { locale, _ } from "svelte-i18n";
	import SvelteMarkdown from "@humanspeak/svelte-markdown";
	import { allowHtmlOnly } from "@humanspeak/svelte-markdown";
	const html = allowHtmlOnly(["strong", "em", "div", "span", "details", "summary", "sup", "sub", "cite", "a", "img", "h1", "h2", "h3", "h4", "h5"]);

	let username = $_("general.unknown");
	const windowTitle = () => {
		if ($page.data.code.split('.')[0] != "error") {
			username = $page.data.data.profile.username;
			if ($page.data.data?.profile.uid == $page.data.auth_info.profile?.uid)
				return $_("general.user_tracks");
		}
		return $_("general.tracks", { values: { username: possessiveForm(username) }});
	}
	let padding = $state($page.data.code.split('.')[0] != "error" ? $page.data.data.profile.description_padding ? "10px" : 0 : "10px");
	let center = $state($page.data.code.split('.')[0] != "error" ? $page.data.data.profile.description_center ? "center" : "initial" : "center");
</script>

{#key $page.params.slug}
	<SwayWindow title={$_("general.description")} id="markdown" contentStyle={`display: ${center == "center" ? "flex" : "block"}; flex-direction: column; align-items: ${center}; padding: ${padding};`}>
		{#if $page.data.code.split('.')[0] != "error" && $page.data.data.profile.description != undefined}
			<SvelteMarkdown
				source={$page.data.data.profile.description}
				renderers={{ html }}
				options={{
					gfm: true,
					headerIds: true,
					headerPrefix: "markdown-",
					breaks: true
				}}
			/>
		{/if}
	</SwayWindow>
{/key}
