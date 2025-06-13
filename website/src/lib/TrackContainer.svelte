<script>
	import { UtaSuki_API } from "$lib/api.js";
	import Dialog from "$lib/Dialog.svelte";
	import TextCounter from "$lib/TextCounter.svelte";
	import { CDN_ADDR, LEN_LIMITS } from "$lib/globals.js";

	import { _ } from "svelte-i18n";
	import { enhance } from "$app/forms";

	let {
		id = null,
		date = "",
		artist = "artist of track",
		album = "album of track",
		title = "title of track",
		image = "/test_album.png",
		imageVer = 0,
		notes = "",
		isOwner = false,
		tabindex = "0"
	} = $props();

	function focus(node) {
		node.focus();
	}

	let showNotes = $state(false);

	let isEdit = $state(false);
	function resetEdit() {
		trackInputVal = title;
		albumInputVal = album;
		artistInputVal = artist;
		noteInputVal = notes;
	}

	let imageInput = $state();
	let imageInputFiles = $state();
	function imageChange() {
		const file = imageInputFiles[0];

		if (file) {
			const reader = new FileReader();
			reader.addEventListener("load", function () {
				imageInput.setAttribute("src", reader.result);
			});
			reader.readAsDataURL(file);
			return;
		}
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
	let trackNameErr = $derived(encodeURIComponent(trackInputVal).length > LEN_LIMITS.TRACK);

	let albumInputVal = $state(album);
	let albumNameErr = $derived(encodeURIComponent(albumInputVal).length > LEN_LIMITS.ALBUM);

	let artistInputVal = $state(artist);
	let artistNameErr = $derived(encodeURIComponent(artistInputVal).length > LEN_LIMITS.ARTIST);

	let noteInputVal = $state(notes);
	let noteErr = $derived(encodeURIComponent(noteInputVal).length > LEN_LIMITS.NOTE);
</script>

{#snippet normal()}
	<!-- svelte-ignore a11y_no_noninteractive_tabindex, a11y_no_static_element_interactions (makes focus toggable) -->
	<div class="track" tabindex={tabindex} onmousedown={(_this) => {
		let lastActiveElement = document.activeElement;
		_this.currentTarget.addEventListener("click", (_this) => {
			lastActiveElement == _this.currentTarget && _this.currentTarget.blur();
			lastActiveElement = null;
			});
		}}>
		<img src={`${CDN_ADDR}/static/images/album_covers/${encodeURIComponent(image)}?${imageVer}`} alt="{album} cover" title={album}>
		<div class="trackInfo">
			<div style="display: flex; flex-direction: row; justify-content: space-between;">
				<h1 title={$_("general.track_name")}>{title}</h1>
				{#if isOwner}
					<div id="trackActions">
						<input
							tabindex={tabindex}
							type="button"
							onclick={() => { resetEdit(); isEdit = true }}
							value={$_("general.edit")}
							title={$_("general.edit_title")}
						/>
						<input
							tabindex={tabindex}
							style:background-color="#561111"
							type="button"
							onclick={() => deleteDialog()}
							value={$_("general.remove")}
							title={$_("general.remove_title")}
						/>
					</div>
				{/if}
			</div>
			<h3 title={$_("general.album_name")} style="color: var(--d2_text);">{album}</h3>
			<h2 title={$_("general.artist_name")}>{artist}</h2>
			{#if notes}
				<input
					value={showNotes ? "-" : "+"}
					type="button"
					style="
						width: 20px;
						height: 20px;
						padding-right: unset;
						outline: unset;
						border: solid 1px var(--unfocused_border);
						text-align: center;
					"
					onclick={() => showNotes = !showNotes}
				/>
			{/if}
			{#if showNotes}
				<p title={$_("general.notes")}>{notes}</p>
			{/if}
		</div>
	</div>
{/snippet}

{#snippet edit()}
<!-- svelte-ignore a11y_no_static_element_interactions, a11y_no_noninteractive_tabindex, a11y_no_noninteractive_element_interactions (makes form escapable) -->
	<form
		class="track"
		onkeydown={(e) => isEdit = e.key != "Escape"}
		tabindex={tabindex}
		method="POST"
		enctype="multipart/form-data"
		action="?/updateTrack"
		use:enhance={() => {
			return async ({ update }) => {
				update({ reset: false });
			};
		}}
	>
		<label for="imageSelect">
			<img src={`${CDN_ADDR}/static/images/album_covers/${encodeURIComponent(image)}?${imageVer}`} alt={album} bind:this={imageInput}>
			<input
				type="file"
				name="file"
				accept="image/*"
				id="imageSelect"
				bind:files={imageInputFiles}
				onchange={() => imageChange()}
			/>
		</label>
		<div class="trackInfo">
			<div style="display: flex; flex-direction: row; justify-content: space-between;">
				<div style:position="relative">
					<input
						id="trackInfoTitleInput"
						type="text"
						name="title"
						bind:value={trackInputVal}
						tabindex={Number(tabindex) + 1}
						autocomplete="off"
						use:focus
						maxlength={LEN_LIMITS.TRACK}
						required
					/>
					<TextCounter inputVal={trackInputVal} error={trackNameErr} maxLength={LEN_LIMITS.TRACK}/>
				</div>
				<div id="trackActions" style:display="flex">
					<input
						style:background-color="#10360D"
						type="submit"
						value={$_("general.save")}
						tabindex={Number(tabindex) + 5}
					/>
					<input
						style:background-color="#561111"
						type="button"
						value={$_("general.cancel")}
						onclick={() => isEdit = false}
						tabindex={Number(tabindex) + 6}
					/>
				</div>
			</div>
			<div style="position: relative; width: fit-content;">
				<input
					id="trackInfoAlbumInput"
					type="text"
					name="album"
					bind:value={albumInputVal}
					tabindex={Number(tabindex) + 2}
					autocomplete="off"
					maxlength={LEN_LIMITS.ALBUM}
				/>
				<TextCounter inputVal={albumInputVal} error={albumNameErr} maxLength={LEN_LIMITS.ALBUM}/>
			</div>
			<div style="position: relative; width: fit-content;">
				<input
					id="trackInfoArtistInput"
					type="text"
					name="artist"
					bind:value={artistInputVal}
					tabindex={Number(tabindex) + 3}
					autocomplete="off"
					maxlength={LEN_LIMITS.ARTIST}
					required
				/>
				<TextCounter inputVal={artistInputVal} error={artistNameErr} maxLength={LEN_LIMITS.ARTIST}/>
			</div>
			<div style:height="1em"></div>
			<div style="position: relative; width: 60%;">
				<textarea
					id="trackInfoNotesInput"
					name="notes"
					bind:value={noteInputVal}
					tabindex={Number(tabindex) + 4}
					autocomplete="off"
					maxlength={LEN_LIMITS.NOTES}
					rows=3
				></textarea>
				<TextCounter inputVal={noteInputVal} error={noteErr} maxLength={LEN_LIMITS.NOTE}/>
			</div>
		</div>
		<input type="hidden" name="id" value={id}>
	</form>
{/snippet}

<!-- todo: add cancel when clicking outside the dialog -->
{#if showDialog}
	<!-- svelte-ignore a11y_no_noninteractive_tabindex, a11y_no_noninteractive_element_interactions (makes form escapable)-->
	<form
		class="overlay"
		style:cursor="unset"
		tabindex="0"
		onkeydown={(e) => e.key == "Escape" && handleDialog(false)}
		method="POST"
		enctype="multipart/form-data"
		action="?/deleteTrack"
		use:enhance
	>
		<Dialog title="dialog.delete" victim={title} onclick={(_this) => handleDialog(_this)}/>
		<input type="hidden" name="id" value={id}>
	</form>
{/if}

{#if isEdit}
	{@render edit()}
{:else}
	{@render normal()}
{/if}

<style>
	input[type="file"] {
		display: none;
	}
	label > img:hover {
		outline: 1px solid var(--border);
	}
	input, textarea {
		/* why, why do we need an "unset everything" just to fix weird element size?? */
		/* and the best part is that it doesn't look the same on chrome... */
		all: unset;
		border: none;
		box-sizing: border-box;
		display: block;
		background-color: var(--input_bg);
		box-shadow: inset 0 0 0 1px var(--unfocused_border);
		padding-right: 50px;
		cursor: text; /* part that is padded uses default pointer? */
	}
	input:focus, textarea:focus {
		outline: 1px var(--accent) solid;
	}
	#trackInfoTitleInput {
		font-size: 2em;
		font-weight: bold;
	}
	#trackInfoAlbumInput {
		font-size: 1.17em;
		font-weight: bold;
		width: fit-content;
	}
	#trackInfoArtistInput {
		font-size: 1.5em;
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
		width: 150px;
		background-color: black;
	}
	.track {
		display: flex;
		flex-direction: row;
		padding: 8px;
	}
	.track:focus, .track:focus-within {
		outline: 1px var(--accent) solid;
		background-color: var(--unfocused_background)
	}
	#trackActions {
		flex-direction: row;
		display: none;
	}
	#trackActions > input {
		height: fit-content;
		padding: 5px 10px;
	}
	.track:hover #trackActions, .track:focus #trackActions, .track:focus-within #trackActions {
		/*box-shadow: inset 0 0 0 1px var(--accent);*/
		display: flex;
	}
	.trackInfo {
		display: flex;
		flex-direction: column;
		flex-grow: 1;
		margin-left: 18px;
	}
	.trackInfo > *:nth-child(2) {
		margin-top: 1px;
	}
	.trackInfo > *:nth-child(3) {
		margin: 6px 0;
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
	.trackInfo h2 {
		word-break: break-all;
		overflow: hidden;
		display: -webkit-box;
		-webkit-line-clamp: 1;
				line-clamp: 1; 
		-webkit-box-orient: vertical;
	}
	.trackInfo h2:hover {
		overflow-y: auto;
		display: inherit;
	}
</style>
