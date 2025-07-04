<script>
	import SwayWindow from "$lib/SwayWindow.svelte";
	import Alert from "$lib/Alert.svelte";
	import AnimatedDots from "$lib/AnimatedDots.svelte";
	import TextCounter from "$lib/TextCounter.svelte";
	import { CDN_ADDR, LEN_LIMITS } from "$lib/globals.js";

	import { page } from "$app/stores";
	import { enhance } from "$app/forms";
	import { _ } from "svelte-i18n";

	let { form } = $props();

	const year = new Date().getFullYear();
	let years = Array.from({ length: year - 1900 + 1 }, (_, i) => year - i);
	let months = Array.from({ length: 12 - 0 }, (_, i) => 0 + i);

	let image = $state();
	let imageInputFiles = $state();
	let imageHasChanged = $state(false);
	function imageChange() {
		const file = imageInputFiles[0];

		if (file) {
			const reader = new FileReader();
			reader.addEventListener("load", function () {
				image.setAttribute("src", reader.result);
				imageHasChanged = true;
			});
			reader.readAsDataURL(file);
			return;
		}
	}

	let addForm = $state();
	let popupTimerID = $state();
	let popup = $state();
	let hidePopup = () => {
		if (popup != null) {
			if (form.code.split('.')[0] != "error") {
				image.setAttribute("src", "/add_image_placeholder.webp");
				imageHasChanged = false;
				addForm.reset();
			}
			popup.style.display = "none";
			clearTimeout(popupTimerID);
		}
	};
	let popupTimer = () => popupTimerID = setTimeout(() => hidePopup(), 3500);

	// form feedback
	let trackInputVal = $state("");
	let trackNameErr = $derived(trackInputVal.length > LEN_LIMITS.TRACK);

	let artistInputVal = $state("");
	let artistNameErr = $derived(artistInputVal.length > LEN_LIMITS.ARTIST);

	let albumInputVal = $state("");
	let albumNameErr = $derived(albumInputVal.length > LEN_LIMITS.ALBUM);

	let noteInputVal = $state("");
	let noteErr = $derived(noteInputVal.length > LEN_LIMITS.NOTE);

	let inFlight = $state(false);
</script>

{#snippet inputWarning(err, code)}
	{#if err}
		<tr>
			<td style="padding-top: 0;"></td>
			<td style="padding-top: 0; color: var(--warning)">{$_(code)}</td>
		</tr>
	{/if}
{/snippet}

<SwayWindow contentStyle="padding: 20px; display: flex; justify-content: center;" title={$_("general.add_track")}>
	<form
		method="POST"
		enctype="multipart/form-data"
		action="?/addTrack"
		bind:this={addForm}
		use:enhance={() => {
			inFlight = true;

			return async ({ update }) => {
				await update({ reset: false });
				inFlight = false;
			}; 
		}}
	>
		<div>
			<label for="imageSelect">
				<img src="/add_image_placeholder.webp" alt="input album" bind:this={image}>
				<input
					type="file"
					name="file"
					accept="image/*"
					id="imageSelect"
					bind:files={imageInputFiles}
					onchange={imageChange}
					disabled={inFlight}
					required
				/>
			</label>
			<table>
				<tbody>
					<tr>
						<td>{$_("general.year")}:</td>
						<td>
							<select
								name="year"
								disabled={inFlight}
								required
							>
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
							<select
								name="month"
								disabled={inFlight}
								required
							>
								{#each months as month}
									{#if month == new Date().getMonth()}
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
							<input
								type="text"
								name="title"
								autocomplete="off"
								maxlength={LEN_LIMITS.TRACK}
								bind:value={trackInputVal}
								disabled={inFlight}
								required
							/>
							<TextCounter style="padding-top: 4px;" inputVal={trackInputVal} error={trackNameErr} maxLength={LEN_LIMITS.TRACK}/>
						</td>
					</tr>
					{@render inputWarning(trackNameErr, "warning.too_long")}
					<tr>
						<td>{$_("general.artist_name")}:</td>
						<td>
							<input
								type="text"
								name="artist"
								autocomplete="off"
								maxlength={LEN_LIMITS.ARTIST}
								bind:value={artistInputVal}
								disabled={inFlight}
								required
							/>
							<TextCounter style="padding-top: 4px;" inputVal={artistInputVal} error={artistNameErr} maxLength={LEN_LIMITS.ARTIST}/>
						</td>
					</tr>
					{@render inputWarning(artistNameErr, "warning.too_long")}
					<tr>
						<td>{$_("general.album_name")}:</td>
						<td style="position: relative;">
							<input
								type="text"
								name="album"
								autocomplete="off"
								maxlength={LEN_LIMITS.ALBUM}
								bind:value={albumInputVal}
								disabled={inFlight}
								required
							/>
							<TextCounter style="padding-top: 4px;" inputVal={albumInputVal} error={albumNameErr} maxLength={LEN_LIMITS.ALBUM}/>
						</td>
					</tr>
					{@render inputWarning(albumNameErr, "warning.too_long")}
					<tr style="height: 100%;">
						<td style="padding-bottom: 0;">{$_("general.notes")}:</td>
						<td style="padding-bottom: 0; height: 100%;">
							<textarea
								name="notes"
								autocomplete="off"
								maxlength={LEN_LIMITS.NOTE}
								disabled={inFlight}
								bind:value={noteInputVal}
							></textarea>
							<TextCounter style="padding-top: 4px;" inputVal={noteInputVal} error={noteErr} maxLength={LEN_LIMITS.NOTE}/>
						</td>
					</tr>
					{@render inputWarning(noteErr, "warning.too_long")}
				</tbody>
			</table>
		</div>
		<div style="display: flex;">
			<input
				type="submit"
				style="padding: 2px 1px; margin-top: 10px;"
				value={$_("general.add")}
				disabled={
					inFlight ||
					!artistInputVal.length ||
					!albumInputVal.length ||
					!trackInputVal.length ||
					!imageHasChanged ||
					trackNameErr ||
					albumNameErr ||
					noteErr ||
					artistNameErr
				}
			/>
		</div>
	</form>

	{#if inFlight}
		<div class="overlay" style:cursor="unset">
			<Alert code="info.adding" mainStyle="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -100%); z-index: 2; min-width: 15vw;">
				<p>{$_("info.adding")}</p><AnimatedDots/>
			</Alert>
		</div>
	{/if}
	{#if form}
		<a bind:this={popup} use:popupTimer class="overlay" onclick={() => hidePopup()} href="/add">
			<Alert code={form.code} mainStyle="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -100%); z-index: 2"/>
		</a>
	{/if}
</SwayWindow>


<style>
	input[type="file"] {
		z-index: -1;
		opacity: 0;
		width: 0;
		height: 0;
		bottom: 0;
		left: 0;
	}
	textarea {
		height: 100%;
		padding-bottom: 0;
		font-size: 16px;
	}

	label {
		height: 300px;
		width: 300px;
		border-radius: var(--border_radius);
	}
	label > img {
		outline: 2px solid var(--unfocused_border);
		object-fit: contain;
		background-color: black;
		width: 300px;
		height: 300px;
		border-radius: inherit;
		transition: outline-color var(--transition);
	}
	label > img:hover {
		outline-color: var(--accent);
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
		padding-top: 4px;
		position: relative;
	}
</style>
