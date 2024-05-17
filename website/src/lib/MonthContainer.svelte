<script>
	export let date = "YYYY-MM";
</script>

<fieldset>
	<legend>{date}</legend>
	<slot />
</fieldset>

<style>
	fieldset {
		border: 1px solid var(--unfocused_border);
		margin-bottom: 32px;
		background-color: #111111;
	}
	legend {
		padding-left: 8px;
		font-size: 20pt;
	}
</style>
