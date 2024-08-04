<script>
	import SwayWindow from "$lib/SwayWindow.svelte";
	import Alert from "$lib/Alert.svelte";
	import { page } from "$app/stores";
	import { enhance } from "$app/forms";
	import { _ } from "svelte-i18n";
	import { CDN_ADDR } from "$lib/globals.js";

	/** @type {import("./$types").ActionData} */
	export let form;

	let years = Array.from({ length: 2024 - 2017 + 1 }, (_, i) => 2024 - i);
	let months = Array.from({ length: 12 - 0 }, (_, i) => 0 + i);

	let imageInput;
	let image;
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
</script>

<SwayWindow title="{$_('general.add_track')}" mainStyle="margin: auto; margin-top: 1rem; max-width: 70rem">
	<form method="POST" enctype="multipart/form-data" action="?/addTrack" use:enhance>
		<div>
			<label for="imageSelect">
				<img src="/add_image_placeholder.webp" alt="input album" bind:this={image}>
				<input type="file" name="file" accept="image/*" id="imageSelect" bind:this={imageInput} on:change={imageChange}>
			</label>
			<table cellpadding="5" cellspacing="0" >
				<tbody>
					<tr>
						<td>{$_("general.year")}:</td>
						<td>
							<select name="year" required>
								{#each years as year}
									<option value="{year}">{year}</option>
								{/each}
							</select>
						</td>
					</tr>
						<td>{$_("general.month")}:</td>
						<td>
							<select name="month" required>
								{#each months as month}
									<option value="{month + 1}">{$_(`months.${month}`)}</option>
								{/each}
							</select>
						</td>
					<tr>
					</tr>
					<tr>
						<td>{$_("general.track_name")}:</td>
						<td>
							<input type="text" name="title" autocomplete="off" required>
						</td>
					</tr>
					<tr>
						<td>{$_("general.artist_name")}:</td>
						<td>
							<input type="text" name="artist" autocomplete="off" required>
						</td>
					</tr>
					<tr>
						<td>{$_("general.album_name")}:</td>
						<td>
							<input type="text" name="album" autocomplete="off" required>
						</td>
					</tr>
					<tr>
						<td>{$_("general.notes")}:</td>
						<td>
							<textarea name="notes" rows="3" autocomplete="off"></textarea>
						</td>
					</tr>
				</tbody>
			</table>
		</div>
		<input type="submit" value="{$_('general.add')}" style="margin-top: 10px" on:click={() => {image.setAttribute("src", "/add_image_placeholder.webp")}}>
	</form>
</SwayWindow>

{#if form?.res.message}
	<a href="/add">
		<div class="overlay"></div>
		<Alert severity="{form.res.message.severity}" code="{form.res.message.code}" mainStyle="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -100%); z-index: 2"/>
	</a>
{/if}
{#if form?.res.error}
	<a href="/add">
		<div class="overlay"></div>
		<Alert severity="{form.res.error.severity}" code="{form.res.error.code}" mainStyle="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -100%); z-index: 2"/>
	</a>
{/if}

<style>
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
</style>
