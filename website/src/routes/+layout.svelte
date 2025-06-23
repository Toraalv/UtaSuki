<script>
	import Nav from "$lib/Nav.svelte";
	import "$lib/i18n/index.js";

	let { children } = $props();
</script>

<Nav></Nav>

{@render children?.()}
