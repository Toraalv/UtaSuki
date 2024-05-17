<script>
	export let title = null;
	export let title_alt = null;
	export let style = null;
</script>

<!-- såhär man vidarebefodrar style attribut? känns som jag tänker för mycket react -->
<div class="sway_window" style="{style}">
	<div class="sway_window_title">
		<h5>{title}</h5>
		<h5>{title_alt}</h5>
	</div>
	<div class="sway_window_content" id="grade_container">
		<slot />
	</div>
</div>

<style>
	.sway_window {
		border: 1px solid var(--unfocused_border);
		background-color: var(--bkg);
		margin: 10px;
		display: flex;
		flex-grow: 1;
		flex-direction: column;
	}

	.sway_window:hover {
	border: 1px solid var(--accent);
	}

	.sway_window_title {
		font-weight: normal;
		padding-left: 4px;
		background-color: var(--unfocused_background);
		color: var(--unfocused_text);
		height: 20px;
		line-height: 20px;
	}
	.sway_window:hover .sway_window_title {
		background-color: var(--accent);
		color: var(--text);
	}
	
	.sway_window_title h5:last-child { display: none; }
	.sway_window_title:hover h5:last-child { display: block; }
	.sway_window_title:hover h5:first-child { display: none; }
	
	.sway_window_content {
		padding: 10px;
		overflow-x: hidden;
	  	overflow-y: auto;
	}
</style>
