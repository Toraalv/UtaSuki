<script>
	import SwayWindow from "$lib/SwayWindow.svelte";

	import { _ } from "svelte-i18n";

	let { mainStyle = null, severity = null, code = null } = $props();
</script>

<SwayWindow
	title={code}
	mainStyle="border-color: var(--{severity}); margin: auto; margin-top: 0rem; max-width: 30rem; {mainStyle}"
	titleStyle="background-color: var(--{severity}); color: var(--text)"
	contentStyle="text-align: center">
	<p>{$_(code)}</p>
</SwayWindow>
