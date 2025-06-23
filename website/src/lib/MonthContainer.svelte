<script>
	let { date = "YYYY-MM", children } = $props();
</script>

<fieldset>
	<legend>{date}</legend>
	{@render children?.()}
</fieldset>

<style>
	fieldset {
		border: 1px solid var(--unfocused_border);
		border-radius: var(--border_radius);
		margin-bottom: 32px;
		background-color: #111111;
	}
	legend {
		padding-left: 8px;
		font-size: 20pt;
	}
</style>
