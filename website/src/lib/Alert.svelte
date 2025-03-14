<script>
	import { _ } from "svelte-i18n";
	import SwayWindow from "$lib/SwayWindow.svelte";

	let { mainStyle = null, severity = null, code = null } = $props();
</script>

<SwayWindow
	title={code}
	mainStyle="border-color: var(--{severity}); margin: auto; margin-top: 1rem; max-width: 30rem; {mainStyle}"
	titleStyle="background-color: var(--{severity}); color: var(--text)"
	contentStyle="text-align: center">
	<p>{$_(code)}</p>
</SwayWindow>
