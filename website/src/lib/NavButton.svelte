<script>
	let {
		href = null,
		active = false,
		onclick = () => {},
		tabindex = 0,
		children
	} = $props();
</script>

<a tabindex={tabindex} onclick={() => onclick()} href="{href}" style="{active ? "background-color: var(--accent); border-color: var(--accent);" : ""}">
	<h4>
		{@render children?.()}
	</h4>
</a>

<style>
	a {
		margin-right: 10px;
		outline: none;
		height: 100%;
		background-color: #111111;
		border-radius: var(--border_radius_small);
		transition: var(--transition);
	}
	h4 {
		height: inherit;
		text-align: center;
		align-content: center;
		padding: 0px 24px;
		font-size: 12pt;
		text-wrap: nowrap;
	}
	a:last-child { margin-right: 0; }
	a:hover {
		background-color: var(--unfocused_background);
		cursor: pointer;
	}
	a:focus { background-color: var(--unfocused_border); }
</style>
