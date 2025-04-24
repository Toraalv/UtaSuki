<script>
	import { CDN_ADDR, LEN_LIMITS } from "$lib/globals.js";
	import { enhance } from "$app/forms";

	let {
		artist = "artist of track",
		album = "album of track",
		title = "title of track",
		image = "/test_album.png",
		notes = "",
		isOwner = false
	} = $props();

	let isEdit = $state(false);

</script>

{#snippet normal()}
	<div class="track">
		<img src={`${CDN_ADDR}/static/images/album_covers/${encodeURIComponent(image)}`} alt="{album} cover">
		<div class="trackInfo">
			<h1>{title}</h1>
			<h3>{artist}</h3>
			{#if notes}
				<p>{notes}</p>
			{/if}
		</div>
		{#if isOwner}
			<div id="trackActions">
				<a onclick={() =>  isEdit = true}>edit</a>
				<a>remove</a>
			</div>
		{/if}
	</div>
{/snippet}

{#snippet edit()}
	<form class="track" onsubmit={() => popupTimer()} method="POST" enctype="multipart/form-data" action="?/updateTrack" use:enhance={() => { return async ({ update }) => { update({ reset: false }); }; }}>
		<img src={`${CDN_ADDR}/static/images/album_covers/${encodeURIComponent(image)}`} alt="{album} cover">
		<div class="trackInfo">
			<!-- a11y: avoid using autofocus. I would, if I could use lambda functions after "use:"! -->
			<input id="trackInfoTitleInput" type="text" name="title" value={title} autocomplete="off" autofocus maxlength={LEN_LIMITS.TRACK}>
			<input id="trackInfoArtistInput" type="text" name="artist" value={artist} autocomplete="off" maxlength={LEN_LIMITS.ARTIST}>
			<textarea id="trackInfoNotesInput" name="notes" autocomplete="off" maxlength={LEN_LIMITS.ARTIST}>{notes}</textarea>
		</div>
		<div id="trackActions">
			<a onclick={() => {}}>save</a>
			<a onclick={() => isEdit = false}>cancel</a>
		</div>
	</form>
{/snippet}

{#if isEdit}
	{@render edit()}
{:else}
	{@render normal()}
{/if}

<style>
	input {
		/* why, why do we need an "unset everything" just to fix weird element size?? */
		/* and the best part is that it doesn't look the same on chrome... */
		all: unset;
		border: none;
		box-sizing: border-box;
		display: block;
		background-color: #161616;
		box-shadow: inset 0 0 0 1px var(--unfocused_border);
		padding: unset;
	}
	#trackInfoTitleInput {
		font-size: 2em;
		font-weight: bold;
	}
	#trackInfoArtistInput {
		font-size: 1.17em;
		font-weight: bold;
	}
	form > * {
		box-sizing: content-box;
	}
	a {
		width: 100%;
		text-decoration-line: underline;
		color: var(--link);
	}
	a:hover {
		cursor: pointer;
	}
	a + a {
		margin-left: 10px;
	}
	img {
		object-fit: contain;
		height: 150px;
		width: 100%;
		max-width: 150px;
		max-height: 150px;
		background-color: black;
	}
	.track {
		display: flex;
		flex-direction: row;
		padding: 8px;
	}
	#trackActions {
		flex-direction: row;
		margin: 16px;
		margin-left: auto;
		display: none;
	}
	.track:hover #trackActions {
		/*box-shadow: inset 0 0 0 1px var(--accent);*/
		display: flex;
	}
	.trackInfo {
		margin-left: 18px;
	}
	/* あっ、ん？えええ？そうなの。全く理解できなかったわ*/
	.trackInfo > *:first-child {
		margin-bottom: 4px;
	}
	.trackInfo h1 {
		position: relative;
		word-break: break-all;
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
		word-break: break-all;
		overflow: hidden;
		display: -webkit-box;
		-webkit-line-clamp: 1;
				line-clamp: 1; 
		-webkit-box-orient: vertical;
	}
	.trackInfo h3:hover {
		overflow-y: auto;
		display: inherit;
	}
</style>
