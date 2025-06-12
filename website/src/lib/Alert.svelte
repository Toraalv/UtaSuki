<script>
	import SwayWindow from "$lib/SwayWindow.svelte";

	import { _ } from "svelte-i18n";

	let {
		mainStyle = null,
		contentStyle = null,
		code = null,
		children
	} = $props();
	let severity = code.split('.')[0];
</script>

<SwayWindow
	title={code}
	mainStyle="border-color: var(--{severity}); margin: auto; margin-top: 0rem; max-width: 30rem; {mainStyle}"
	titleStyle="background-color: var(--{severity}); color: var(--text)"
	contentStyle="display: flex; flex-direction: row; justify-content: center; text-align: center; {contentStyle}">
	{#if children}
		{@render children()}
	{:else}
		<p>{@html $_(code)}</p>
	{/if}
</SwayWindow>

