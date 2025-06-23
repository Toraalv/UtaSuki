<script>
	let {
		title = null,
		altTitle = title,
		mainStyle = null,
		titleStyle = null,
		contentStyle = null,
		content = $bindable(),
		children
	} = $props();
</script>

<div class="swayWindow" style={mainStyle}>
	<div class="swayWindowTitle" style={titleStyle}>
		<h5 title={altTitle}>{title}</h5>
	</div>
	<div bind:this={content} class="swayWindowContent" style={contentStyle}>
		{@render children?.()}
	</div>
</div>

<style>
	.swayWindow {
		position: relative;
		margin: 10px;
		display: flex;
		flex-grow: 1;
		flex-direction: column;
		overflow: auto;

		/* new and improved™ */
		/*border-radius: var(--border_radius);*/
		/*border: 2px solid var(--unfocused_background);*/
	}
	.swayWindow:hover .swayWindowTitle, .swayWindow:hover .swayWindowContent, .swayWindow:focus .swayWindowTitle, .swayWindow:focus .swayWindowContent {
		border-color: var(--accent);
	}
	.swayWindow:hover .swayWindowTitle, .swayWindow:focus .swayWindowTitle {
		background-color: var(--accent);
		color: var(--text);
	}
	.swayWindowTitle {
		font-weight: normal;
		padding: 0 4px;
		background-color: var(--unfocused_background);
		color: var(--unfocused_text);
		height: 20px;
		line-height: 20px;

		/* new and improved™ */
		border-radius: var(--border_radius) var(--border_radius) 0 0;
		border-top: 2px solid var(--unfocused_background);
		border-right: 2px solid var(--unfocused_background);
		border-left: 2px solid var(--unfocused_background);

		transition: 0.2s;

		/* funkar bra med border-radius */
		text-align: center;
	}
	.swayWindowTitle > * {
		overflow-x: hidden;
		text-overflow: ellipsis;
		text-wrap: nowrap;
	}
	.swayWindowContent {
		padding: 10px;
		overflow-x: hidden;
	  	overflow-y: auto;
		background-color: var(--bg);

		/* new and improved™ */
		height: 100%;
		border-radius: 0 0 var(--border_radius) var(--border_radius);
		border-right: 2px solid var(--unfocused_background);
		border-bottom: 2px solid var(--unfocused_background);
		border-left: 2px solid var(--unfocused_background);

		transition: 0.2s;
	}
</style>

