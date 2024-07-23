<script>
	import { CDN_ADDR } from "$lib/globals.js";

	export let artist = "artist of track";
	export let album = "album of track";
	export let title = "title of track";
	export let image = "/test_album.png";
	export let description = "this is a description of the track that I've added to my list of favourite tracks for every month, very cool yes I know.";
</script>
<div class="track">
	<img src="{image.substring(0, 5) == "https" ? image : (CDN_ADDR + image)}" alt="{album} cover">
	<div class="trackInfo">
		<h1>{title}</h1>
		<h3>{artist}</h3>
		{#if description}
			<p>{description}</p>
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
