<script>
	import SwayWindow from "$lib/SwayWindow.svelte";

	import { _ } from "svelte-i18n";

	let {
		mainStyle = null,
		title = null,
		textBody = null,
		toDelete = null,
		onclick = () => {}, // this feels convoluted?
		action = "",
		data = {}
	} = $props();

	let severity = title.split('.')[0];
</script>

<SwayWindow
	title={title}
	mainStyle="border-color: var(--{severity}); margin: auto; margin-top: 0rem; max-width: 30rem; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -100%); z-index: 2 {mainStyle}"
	titleStyle="background-color: var(--{severity}); color: var(--text)"
	contentStyle="text-align: center">
	<p>{@html $_(title, { values: { thing: toDelete } })}</p>
	<!-- onkeydown event doesn't work -->
	<form onkeydown={(e) => e.key == "Escape" && onclick(false)} method="POST" enctype="multipart/form-data" action="?/{action}">
		<input type="submit" value={$_("dialog.yes")} onclick={() => onclick(true)}>
		<input type="button" value={$_("dialog.no")} onclick={() => onclick(false)}>
		<input type="text" name="data" value={JSON.stringify(data)} style:display="none"> <!-- now this is starting to feel weird... -->
	</form>
</SwayWindow>

<style>
	form {
		display: flex;
		flex-direction: row;
	}
	input + input {
		margin-left: 40px;
	}
</style>
