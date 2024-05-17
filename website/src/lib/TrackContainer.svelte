<script>
	// const är bara för att svelte inte ska klaga, använder inte de fälten precis just nu
	export let artist = "artist of track";
	export const album = "album of track";
	export let title = "title of track";
	export const released = "2020-05-13";
	export let image = "/test_album.png";
	export let description = "this is a description of the track that I've added to my list of favourite tracks for every month, very cool yes I know.";
	export const lastEdit = ""
</script>

<div class="track">
	<img src="{image}" alt="förlåt">
	<div class="trackInfo">
		<h1>{title}</h1>
		<h3>{artist}</h3>
		{#if description}
			<p>{description}</p>
		{/if}
		{#if lastEdit}
			<h5>Last edit: {lastEdit}</h5>
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
	.trackInfo h1:hover { /* jag hatar och suger på css */
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
