<script>
	import { UtaSuki_API } from "$lib/api.js";
	import Dialog from "$lib/Dialog.svelte";
	import { CDN_ADDR, LEN_LIMITS } from "$lib/globals.js";

	import { _ } from "svelte-i18n";
	import { enhance } from "$app/forms";

	let {
		id = null,
		artist = "artist of track",
		album = "album of track",
		title = "title of track",
		image = "/test_album.png",
		notes = "",
		isOwner = false
	} = $props();

	function focus(node) {
		node.focus();
	}

	let isEdit = $state(false);
	function resetEdit() {
		trackInputVal = title;
		artistInputVal = artist;
		noteInputVal = notes;
	}

	let showDialog = $derived(false);
	function deleteDialog() {
		showDialog = true;
	}
	function handleDialog(res) {
		if (!res)
			showDialog = false;
	}

	// form feedback
	let trackInputVal = $state(title);
	let trackNameErr = $derived(encodeURIComponent(trackInputVal).length > LEN_LIMITS.GENERAL);

	let artistInputVal = $state(artist);
	let artistNameErr = $derived(encodeURIComponent(artistInputVal).length > LEN_LIMITS.GENERAL);

	let noteInputVal = $state(notes);
	let noteErr = $derived(encodeURIComponent(noteInputVal).length > LEN_LIMITS.NOTE);
</script>

<!-- it would be nice to put these in a seperate file and export multiple snippets but due to bug or limitation of svelte, exporting a snippet that begins with a table element does not work -->
{#snippet textCounter(inputVal, err, MAX_LEN)}
	<p style="position: absolute; top: 0; right: 0; margin: 0 10px; height: 100%; align-content: center; {`color: var(--${err ? "warning" : "d2_text"});`}">{MAX_LEN - encodeURIComponent(inputVal).length}</p>
{/snippet}

{#snippet normal()}
	<div class="track">
		<img src={`${CDN_ADDR}/static/images/album_covers/${encodeURIComponent(image)}`} alt="{album} cover">
		<div class="trackInfo">
			<div>
				<h1>{title}</h1>
				{#if isOwner}
					<div id="trackActions">
						<input type="button" onclick={() => { resetEdit(); isEdit = true }} value={$_("general.edit")}>
						<input style:background-color="#561111" type="button" onclick={() => deleteDialog()} value={$_("general.remove")}>
					</div>
				{/if}
			</div>
			<h3>{artist}</h3>
			{#if notes}
				<p>{notes}</p>
			{/if}
		</div>
	</div>
{/snippet}

{#snippet edit()}
	<form class="track" onkeydown={(e) => isEdit = e.key != "Escape"} onsubmit={() => popupTimer()} method="POST" enctype="multipart/form-data" action="?/updateTrack" use:enhance={() => { return async ({ update }) => { update({ reset: false }); }; }}>
		<img src={`${CDN_ADDR}/static/images/album_covers/${encodeURIComponent(image)}`} alt="{album} cover">
		<div class="trackInfo">
			<div>
				<div style:position="relative">
					<input id="trackInfoTitleInput" type="text" name="title" bind:value={trackInputVal} autocomplete="off" use:focus maxlength={LEN_LIMITS.TRACK} required>
					{@render textCounter(trackInputVal, trackNameErr, LEN_LIMITS.TRACK)}
				</div>
				<div id="trackActions" style:display="flex">
					<input style:background-color="#10360D" type="submit" value={$_("general.save")}>
					<input style:background-color="#561111" type="button" value={$_("general.cancel")} onclick={() => isEdit = false}>
				</div>
			</div>
			<div style="position: relative; width: fit-content;">
				<input id="trackInfoArtistInput" type="text" name="artist" bind:value={artistInputVal} autocomplete="off" maxlength={LEN_LIMITS.ARTIST} required>
				{@render textCounter(artistInputVal, artistNameErr, LEN_LIMITS.ARTIST)}
			</div>
			<div style:height="1em"></div>
			<div style="position: relative; width: 60%;">
				<textarea id="trackInfoNotesInput" name="notes" bind:value={noteInputVal} autocomplete="off" maxlength={LEN_LIMITS.NOTES} rows=3></textarea>
				{@render textCounter(noteInputVal, noteErr, LEN_LIMITS.NOTE)}
			</div>
		</div>
	</form>
{/snippet}

<!-- todo: add cancel when clicking outside the dialog -->
{#if showDialog}
	<form use:focus class="overlay" style:cursor="unset" onkeydown={(e) => e.key == "Escape" && handleDialog(false)} method="POST" enctype="multipart/form-data" action="?/deleteTrack" use:enhance={() => { return async ({ update }) => { update({ reset: false }); }; }} tabindex="0">
		<Dialog title="dialog.delete" victim={title} onclick={(_this) => handleDialog(_this)}/>
		<input type="hidden" name="id" value={id}> <!-- enhance? -->
	</form>
{/if}

{#if isEdit}
	{@render edit()}
{:else}
	{@render normal()}
{/if}

<style>
	input, textarea {
		/* why, why do we need an "unset everything" just to fix weird element size?? */
		/* and the best part is that it doesn't look the same on chrome... */
		all: unset;
		border: none;
		box-sizing: border-box;
		display: block;
		background-color: #161616;
		box-shadow: inset 0 0 0 1px var(--unfocused_border);
		padding-right: 50px;
		cursor: text; /* part that is padded uses default pointer? */
	}
	#trackInfoTitleInput {
		font-size: 2em;
		font-weight: bold;
	}
	#trackInfoArtistInput {
		font-size: 1.17em;
		font-weight: bold;
		width: fit-content;
	}
	#trackInfoNotesInput {
		width: 100%;
	}
	form > * {
		box-sizing: content-box;
	}
	input + input {
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
		display: none;
	}
	#trackActions > input {
		height: fit-content;
		padding: 5px 10px;
	}
	.track:hover #trackActions {
		/*box-shadow: inset 0 0 0 1px var(--accent);*/
		display: flex;
	}
	.trackInfo {
		display: flex;
		flex-direction: column;
		flex-grow: 1;
		margin-left: 18px;
	}
	/* あっ、ん？えええ？そうなの。全く理解できなかったわ*/
	.trackInfo > *:first-child {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
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
