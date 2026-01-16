<script>
	import Nav from "$lib/Nav.svelte";
	import { BG_PATH } from "$lib/globals.js";
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
					document.documentElement.style.setProperty("--opacity", $page.data.data.profile.opacity / 100);
					document.documentElement.style.setProperty("--blur", $page.data.data.profile.blur);
				} else if ($page.data.auth_info.authed) {
					document.documentElement.style.setProperty("--accent", $page.data.auth_info.profile.accent);
					document.documentElement.style.setProperty("--accent_text", $page.data.auth_info.profile.accent_text);
					document.documentElement.style.setProperty("--opacity", $page.data.auth_info.profile.opacity / 100);
					document.documentElement.style.setProperty("--blur", $page.data.auth_info.profile.blur);
				} else {
					document.documentElement.style.setProperty("--accent", "var(--default_accent)");
					document.documentElement.style.setProperty("--accent_text", "var(--default_accent_text)");
					document.documentElement.style.setProperty("--opacity", "var(--default_opacity)");
					document.documentElement.style.setProperty("--blur", "var(--default_blur)");
				}
			}
		});
	});

	let { children } = $props();
</script>

{#if $page.data.code.split('.')[0] != "error"}
	{#if $page.route.id.match("/user/\\[slug]")?.length}
		<div id="bkg" style:background-image={$page.data.data.profile.bkg == null ? "none" : `url(${BG_PATH}/${$page.data.data.profile.bkg}?${$page.data.data.profile.bkg_ver})`}></div>
	{:else if $page.data.auth_info?.authed}
		<div id="bkg" style:background-image={$page.data.auth_info.profile.bkg == null ? "none" : `url(${BG_PATH}/${$page.data.auth_info.profile.bkg}?${$page.data.auth_info.profile.bkg_ver})`}></div>
	{:else}
		<div id="bkg" style:background-image="var(--default_bkg)"></div>
	{/if}
{:else}
	<div id="bkg" style:background-image="var(--default_bkg)"></div>
{/if}

<Nav></Nav>
{@render children?.()}

<style>
	#bkg {
		position: absolute;
		width: calc(100% + var(--blur) * 4);
		height: calc(100% + var(--blur) * 4);
		top: calc(var(--blur) * -2);
		left: calc(var(--blur) * -2);
		background-color: #000000;
		background-size: cover;
		background-position: center;
		background-repeat: no-repeat;
		filter: blur(var(--blur));
	}
</style>
