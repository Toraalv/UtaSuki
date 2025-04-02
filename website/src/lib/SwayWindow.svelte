<script>
	let {
		title = null,
		altTitle = title,
		mainStyle = null,
		titleStyle = null,
		contentStyle = null,
		id = null,
		children
	} = $props();
</script>

<div class="sway_window" style={mainStyle}>
	<div class="sway_window_title" style={titleStyle}>
		<h5 title={altTitle}>{title}</h5>
	</div>
	<div class="sway_window_content" id={id} style={contentStyle}>
		{@render children?.()}
	</div>
</div>

<style>
	.sway_window {
		position: relative;
		border: 1px solid var(--unfocused_border);
		background-color: var(--bg);
		margin: 10px;
		display: flex;
		flex-grow: 1;
		flex-direction: column;
		overflow: auto;
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
	
	.sway_window_content {
		padding: 10px;
		overflow-x: hidden;
	  	overflow-y: auto;
	}
</style>
