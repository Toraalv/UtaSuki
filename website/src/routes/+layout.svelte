<script>
	import Nav from "$lib/Nav.svelte";
	import { CDN_ADDR } from "$lib/globals.js";
	import "$lib/i18n/index.js";
	import { onMount, tick } from "svelte";
	import { page } from "$app/stores";

	$effect.pre(() => {
		$page.route.id;
		tick().then(() => {
			if ($page.data.code.split('.')[0] != "error") {
				if ($page.route.id.match("/user/\\[slug]")?.length) {
					document.documentElement.style.setProperty("--accent", $page.data.data.profile.accent);
					document.documentElement.style.setProperty("--accent_text", $page.data.data.profile.accent_text);
				} else if ($page.data.auth_info.authed) {
					document.documentElement.style.setProperty("--accent", $page.data.auth_info.profile.accent);
					document.documentElement.style.setProperty("--accent_text", $page.data.auth_info.profile.accent_text);
				} else {
					document.documentElement.style.setProperty("--accent", "var(--default_accent)");
					document.documentElement.style.setProperty("--accent_text", "var(--default_accent_text)");
				}
			}
		});
	});

	let { children } = $props();
</script>

{#if $page.data.code.split('.')[0] != "error"}
	{#if $page.data.auth_info?.authed}
		<div id="bkg" style:background-image={$page.data.auth_info.profile.bkg == null ? "none" : `url(${CDN_ADDR}/static/images/backgrounds/${$page.data.auth_info.profile.bkg}?${$page.data.auth_info.profile.bkg_ver})`}></div>
	{:else}
		<div id="bkg"></div>
	{/if}
{:else}
	<div id="bkg"></div>
{/if}

<Nav></Nav>
{@render children?.()}

<style>
	#bkg {
		position: absolute;
		width: calc(100% + 16px);
		height: calc(100% + 16px);
		top: -8px;
		left: -8px;
		background-color: #000000;
		background-size: cover;
		background-position: center;
		background-repeat: no-repeat;
		filter: blur(8px);
		-webkit-filter: blur(8px);
	}
</style>
