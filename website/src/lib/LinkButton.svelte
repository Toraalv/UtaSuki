<script>
	let {
		href = null,
		active = false,
		style = "",
		onclick = () => {},
		children
	} = $props();
</script>

<a onclick={() => onclick()} href="{href}">
	<h4 style="{active ? "background-color: var(--accent); border-color: var(--accent);" : ""} {style}">
		{@render children?.()}
	</h4>
</a>

<style>
	a {
		margin: 5px 0;
	}
	h4 {
		background-color: #111111;
		text-align: center;
		padding: 6px;
		font-size: 14pt;
	}
	h4:hover {
		background-color: var(--unfocused_background);
	}
</style>
