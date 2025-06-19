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
	mainStyle="margin: auto; margin-top: 0rem; max-width: 30rem; {mainStyle}"
	titleStyle="background-color: var(--{severity}); color: var(--text); border-color: var(--{severity})"
	contentStyle="display: flex; flex-direction: row; justify-content: center; text-align: center; {contentStyle}; border-color: var(--{severity})">
	{#if children}
		{@render children()}
	{:else}
		<p>{@html $_(code)}</p>
	{/if}
</SwayWindow>

