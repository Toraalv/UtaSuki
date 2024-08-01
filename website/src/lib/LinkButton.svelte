<!-- was this component really necessary? -->
<script>
	export let href = null;
	export let active = false;
	export let style = "";
</script>

<a href="{href}">
	<h4 style="{active ? "background-color: var(--accent); border-color: var(--accent);" : ""} {style}">
		<slot />
	</h4>
</a>

<style>
	h4 {
		background-color: #111111;
		text-align: center;
		padding: 6px;
		margin-bottom: 10px;
		font-size: 14pt;
	}
	h4:hover {
		background-color: var(--unfocused_background);
	}
</style>
