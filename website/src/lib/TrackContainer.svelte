<script>
	import { CDN_ADDR } from "$lib/globals.js";

	let {
		artist = "artist of track",
		album = "album of track",
		title = "title of track",
		image = "/test_album.png",
		notes = ""
	} = $props();
</script>
<div class="track">
	<img src={`${CDN_ADDR}/static/images/album_covers/${encodeURIComponent(image)}`} alt="{album} cover">
	<div class="trackInfo">
		<h1>{title}</h1>
		<h3>{artist}</h3>
		{#if notes}
			<p>{notes}</p>
		{/if}
	</div>
</div>

<style>
	img {
		object-fit: cover;
		height: 150px;
		width: 100%;
		max-width: 150px;
		max-height: 150px;
	}

	.track {
		display: flex;
		flex-direction: row;
		padding: 8px;
	}
	.trackInfo {
		/* font-family: "DejaVuSans"; */
		margin-left: 18px;
	}
	.trackInfo h1 {
		position: relative;
		margin: 0;
		font-weight: bold;
		overflow: hidden;
		display: -webkit-box;
		-webkit-line-clamp: 1;
				line-clamp: 1; 
		-webkit-box-orient: vertical;
	}
	.trackInfo h1:hover {
		overflow-y: auto;
		display: inherit;
	}
	.trackInfo h3 {
		overflow: hidden;
		display: -webkit-box;
		-webkit-line-clamp: 1;
				line-clamp: 1; 
		-webkit-box-orient: vertical;
	}
</style>
