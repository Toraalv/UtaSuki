<script>
	let {
		href = null,
		active = false,
		style = "",
		onclick = () => {},
		children
	} = $props();
</script>

<a onclick={() => onclick()} href="{href}" style={style}>
	<h4 style={active ? "background-color: var(--accent); border-color: var(--accent); color: var(--accent_text)" : ""}>
		{@render children?.()}
	</h4>
</a>

<style>
	a {
		padding: 5px 0;
		outline: none;
	}
	h4 {
		border-radius: var(--border_radius_small);
		transition: var(--transition);
		background-color: #111111;
		text-align: center;
		padding: 6px 24px;
		font-size: 14pt;
		height: inherit;
		text-align: center;
		align-content: center;
	}
	a:first-child { padding: 0 0 5px; }
	a:last-child { padding: 5px 0 0; }
	a:hover > * { background-color: var(--unfocused_background); }
	a:focus > * { background-color: var(--unfocused_border); }
</style>
