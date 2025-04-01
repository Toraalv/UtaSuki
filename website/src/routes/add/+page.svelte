<script>
	import SwayWindow from "$lib/SwayWindow.svelte";
	import ControlPanel from "$lib/ControlPanel.svelte";
	import Footer from "$lib/Footer.svelte";
	import Alert from "$lib/Alert.svelte";
	import { CDN_ADDR } from "$lib/globals.js";

	import { goto } from "$app/navigation";
	import { page } from "$app/stores";
	import { enhance } from "$app/forms";
	import { _ } from "svelte-i18n";

	const ALBUM_MAX_LEN = 255 - 5; // album name is used for the album cover's image. ext4 maximum filename length minus possible file extensions (including '.')
	const GENERAL_MAX_LEN = 255;
	const NOTE_MAX_LEN = 1024;

	let { form } = $props();

	const year = new Date().getFullYear();
	let years = Array.from({ length: year - 2017 + 1 }, (_, i) => year - i);
	let months = Array.from({ length: 12 - 0 }, (_, i) => 0 + i);

	let imageInput = $state();
	let image = $state();
	function imageChange() {
		const file = imageInput.files[0];

		if (file) {
			const reader = new FileReader();
			reader.addEventListener("load", function () {
				image.setAttribute("src", reader.result);
			});
			reader.readAsDataURL(file);
			return;
		}
	}

	let redirectTimeoutID = $state();
	let redirectTimeout = () => redirectTimeoutID = setTimeout(() => goto("/add"), 2000);

	// form feedback
	let trackInputVal = $state("");
	let trackNameErr = $derived(encodeURIComponent(trackInputVal).length > GENERAL_MAX_LEN);

	let artistInputVal = $state("");
	let artistNameErr = $derived(encodeURIComponent(artistInputVal).length > GENERAL_MAX_LEN);

	let albumInputVal = $state("");
	let albumNameErr = $derived(encodeURIComponent(albumInputVal).length > ALBUM_MAX_LEN);

	let noteInputVal = $state("");
	let noteErr = $derived(encodeURIComponent(noteInputVal).length > NOTE_MAX_LEN);
</script>

{#snippet textCounter(inputVal, err, MAX_LEN)}
	<p style="position: absolute; top: 0; right: 0; margin: 0 10px; height: 100%; align-content: center; {`color: var(--${err ? "warning" : "d2_text"});`}">{MAX_LEN - encodeURIComponent(inputVal).length}</p>
{/snippet}

{#snippet inputWarning(err, code)}
	{#if err}
		<tr>
			<td>
			<td style="color: var(--warning)">{$_(code)}</td>
		</tr>
	{/if}
{/snippet}

<div style="display: flex; flex-direction: column; justify-content: space-between; height: 100vh; margin: 0; padding: 0;">
	<ControlPanel/>
	<Footer/>
</div>

<SwayWindow contentStyle="padding: 20px;" title={$_("general.add_track")}>
	<form method="POST" enctype="multipart/form-data" action="?/addTrack" use:enhance>
		<div>
			<label for="imageSelect">
				<img src="/add_image_placeholder.webp" alt="input album" bind:this={image}>
				<input type="file" name="file" accept="image/*" id="imageSelect" bind:this={imageInput} onchange={imageChange} required> <!-- show user they have to attach image -->
			</label>
			<table>
				<tbody>
					<tr>
						<td>{$_("general.year")}:</td>
						<td>
							<select name="year" required>
								{#each years as year}
									{#if year == new Date().getFullYear()}
										<option value="{year}" selected>{year}</option>
									{:else}
										<option value="{year}">{year}</option>
									{/if}
								{/each}
							</select>
						</td>
					</tr>
					<tr>
						<td>{$_("general.month")}:</td>
						<td>
							<select name="month" required>
								{#each months as month}
									{#if month + 1 == new Date().getMonth()} <!-- based on my use I only add tracks at the start of the next month -->
										<option value="{month + 1}" selected>{$_(`months.${month}`)}</option>
									{:else}
										<option value="{month + 1}">{$_(`months.${month}`)}</option>
									{/if}
								{/each}
							</select>
						</td>
					</tr>
					<tr>
						<td>{$_("general.track_name")}:</td>
						<td>
							<!-- these maxlength are just to limit the user somewhat. the server will never accept the values either way -->
							<input type="text" name="title" autocomplete="off" maxlength="255" bind:value={trackInputVal} required>
							{@render textCounter(trackInputVal, trackNameErr, GENERAL_MAX_LEN)}
						</td>
					</tr>
					{@render inputWarning(trackNameErr, "warning.name_too_long")}
					<tr>
						<td>{$_("general.artist_name")}:</td>
						<td>
							<input type="text" name="artist" autocomplete="off" maxlength="255" bind:value={artistInputVal} required>
							{@render textCounter(artistInputVal, artistNameErr, GENERAL_MAX_LEN)}
						</td>
					</tr>
					{@render inputWarning(artistNameErr, "warning.name_too_long")}
					<tr>
						<td>{$_("general.album_name")}:</td>
						<td style="position: relative;">
							<input type="text" name="album" autocomplete="off" maxlength="250" bind:value={albumInputVal} required>
							{@render textCounter(albumInputVal, albumNameErr, ALBUM_MAX_LEN)}
						</td>
					</tr>
					{@render inputWarning(albumNameErr, "warning.name_too_long")}
					<tr>
						<td>{$_("general.notes")}:</td>
						<td>
							<textarea name="notes" rows="3" autocomplete="off" maxlength="1024" bind:value={noteInputVal}></textarea>
							{@render textCounter(noteInputVal, noteErr, NOTE_MAX_LEN)}
						</td>
					</tr>
					{@render inputWarning(noteErr, "warning.too_long")}
				</tbody>
			</table>
		</div>
		<div style="display: flex;">
			<input style="padding: 2px 1px; margin-top: 10px;" type="submit" value={$_("general.add")} onclick={() => {image.setAttribute("src", "/add_image_placeholder.webp"); redirectTimeout(); }}>
		</div>
	</form>
</SwayWindow>

{#if form?.res}
	<a onclick={() => clearTimeout(redirectTimeoutID)} href="/add">
		<div class="overlay"></div>
		<Alert code={form.res.code} mainStyle="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -100%); z-index: 2"/>
	</a>
{/if}

<style>
	input[type="file"] {
		display: none;
	}
	input[type="text"], textarea {
		padding-right: 70px;
	}
	.overlay {
		position: fixed;
		width: 100%;
		height: 100%;
		top: 0;
		left: 0;
		background-color: rgba(0, 0, 0, 0.5);
		z-index: 1;
		cursor: pointer;
	}

	label > img {
		border: 1px solid var(--unfocused_border);
		object-fit: fill;
		width: 300px;
		height: 300px;
	}
	
	label > img:hover {
		outline: 1px solid var(--border);
	}
	div {
		display: flex;
		flex-direction: row;
	}

	table {
		flex-grow: 1;
		margin-left: 20px;
	}
	td {
		padding: 0;
		position: relative;
	}
</style>
