<script>
	import Nav from "$lib/Nav.svelte";
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

<Nav></Nav>
{@render children?.()}
