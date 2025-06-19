<script>
	let {
		href = null,
		active = false,
		style = "",
		onclick = () => {},
		children
	} = $props();
</script>

<a onclick={() => onclick()} href="{href}" style="{active ? "background-color: var(--accent); border-color: var(--accent);" : ""} {style}">
	<h4>
		{@render children?.()}
	</h4>
</a>

<style>
	a {
		margin: 5px 0;
		outline: none;
		background-color: #111111;
		border-radius: var(--border_radius_small);
		transition: 0.2s;
	}
	h4 {
		text-align: center;
		padding: 6px 24px;
		font-size: 14pt;
		height: inherit;
		text-align: center;
		align-content: center;
	}
	a:first-child { margin: 0 0 5px; }
	a:last-child { margin: 5px 0 0; }
	a:hover { background-color: var(--unfocused_background); }
	a:focus { background-color: var(--unfocused_border); }
</style>
