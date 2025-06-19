<script>
	import SwayWindow from "$lib/SwayWindow.svelte";

	import { _ } from "svelte-i18n";

	function focus(node) {
		node.focus();
	}

	let {
		mainStyle = null,
		title = null,
		textBody = null,
		victim = null,
		onclick = () => {} // this feels convoluted?
	} = $props();

	let severity = title.split('.')[0];
</script>

<SwayWindow
	title={title}
	mainStyle="margin: auto; margin-top: 0rem; max-width: 30rem; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -100%); z-index: 2 {mainStyle}"
	titleStyle="background-color: var(--{severity}); color: var(--text); border-color: var(--{severity});"
	contentStyle="text-align: center; border-color: var(--{severity})">
	<p>{@html $_(title, { values: { thing: victim } })}</p>
	<div style="display: flex; flex-direction: row;">
		<input type="submit" value={$_("dialog.yes")} onclick={() => onclick(true)} use:focus>
		<input type="button" value={$_("dialog.no")} onclick={() => onclick(false)}>
	</div>
</SwayWindow>

<style>
	input + input {
		margin-left: 40px;
	}
</style>
