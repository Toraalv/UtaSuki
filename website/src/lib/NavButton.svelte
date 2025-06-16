<script>
	let {
		href = null,
		active = false,
		onclick = () => {},
		children
	} = $props();
</script>

<a onclick={() => onclick()} href="{href}" style="{active ? "background-color: var(--accent); border-color: var(--accent);" : ""}">
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
		transition: 0.2s;
	}
	h4 {
		height: inherit;
		text-align: center;
		align-content: center;
		padding: 0px 24px;
		font-size: 12pt;
	}
	a:hover { background-color: var(--unfocused_background); }
	a:focus { background-color: var(--unfocused_border); }
</style>
