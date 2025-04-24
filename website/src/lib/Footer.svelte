<script>
	import SwayWindow from "$lib/SwayWindow.svelte";

	import { _ } from "svelte-i18n";
</script>

<SwayWindow title={$_("general.links")} mainStyle="min-width: 300px; max-width: 300px; flex-grow: 0; overflow: unset" contentStyle="display: flex; flex-direction: column">
	<a href="/about">{$_("general.about")}</a>
	<a href="https://github.com/Toraalv/UtaSuki">github</a>
</SwayWindow>

<style>
	a {
		width: 100%;
		text-decoration-line: underline;
		color: var(--link);
	}
	a + a {
		margin-top: 10px;
	}
</style>
