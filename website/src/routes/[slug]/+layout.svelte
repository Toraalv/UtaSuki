<script>
	import { page } from "$app/stores";
	import SwayWindow from "$lib/SwayWindow.svelte";
	import Alert from "$lib/Alert.svelte";
	import LinkButton from "$lib/LinkButton.svelte";
	import { _ } from "svelte-i18n";

	let { children } = $props();
</script>

<SwayWindow title={$_('general.years')} mainStyle="max-width: 300px; min-width: 300px" contentStyle="display: flex; flex-direction: column; flex-grow: 1; justify-content: space-between">
	{#if $page.data.years.error}
		<div>
			<Alert severity={$page.data.years.error.severity} code={$page.data.years.error.code}/>
		</div>
	{:else}
		<div>
			{#each $page.data.years as year}
				<LinkButton onclick={() => document.getElementById("sway_window_tracks").scrollTop = 0} href="/{$page.url.pathname.split("/")[1]}/{year}" active={$page.params.slug == year}>{year}</LinkButton> <!-- I really don't like this document.getElementById(...) but I have not succesfully implemented a solution using $effect.pre and tick() yet -->
			{/each}
		</div>
	{/if}

	<LinkButton href="/" style="margin: 0">{$_("general.home")}</LinkButton>
</SwayWindow>

{@render children?.()}
