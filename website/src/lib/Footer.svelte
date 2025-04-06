<script>
	import SwayWindow from "$lib/SwayWindow.svelte";

	import { _ } from "svelte-i18n";
</script>

<SwayWindow title={$_("general.links")} mainStyle="width: 300px; flex-grow: 0; overflow: unset" contentStyle="display: flex; flex-direction: column">
	<a class="links" href="/about">{$_("general.about")}</a>
	<a class="links" href="https://github.com/Toraalv/UtaSuki">github</a>
</SwayWindow>

<style>
	.links {
		width: 100%;
		text-decoration-line: underline;
		color: var(--link);
	}
	.links + .links {
		margin-top: 10px;
	}
</style>
