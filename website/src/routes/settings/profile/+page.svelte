<script>
	import SwayWindow from "$lib/SwayWindow.svelte";
	import Alert from "$lib/Alert.svelte";
	import AnimatedDots from "$lib/AnimatedDots.svelte";
	import TextCounter from "$lib/TextCounter.svelte";
	import { setLang } from "$lib/helpers.js";
	import { CDN_ADDR, LEN_LIMITS } from "$lib/globals.js";
	import { flightPopup, resultPopup } from "../snippets.svelte";

	import { page } from "$app/stores";
	import { enhance } from "$app/forms";
	import { _, locale, locales } from "svelte-i18n";

	let { form } = $props();
	let formRes = $state(undefined);

	let imageInput = $state();
	let image = $state();
	let imageHasChanged = $state(false);
	function imageChange() {
		const file = imageInput.files[0];

		if (file) {
			const reader = new FileReader();
			reader.addEventListener("load", (event) => {
				// warn user too big file
				image.setAttribute("src", reader.result);
				imageHasChanged = true;
			});
			reader.readAsDataURL(file);
			return;
		}
	}

	let inFlight = $state(false);
</script>

<form
	method="POST"
	enctype="multipart/form-data"
	action="/settings/?/updateSettings"
	use:enhance={() => {
		inFlight = true;
		formRes = undefined;

		return async ({ update, result }) => {
			await update({ reset: false });
			inFlight = false;
			formRes = result.data;
		};
	}}
>
	<table>
		<tbody>
			<tr>
				<td></td>
				<td>
					<label for="imageSelect">
						<img src={CDN_ADDR + $page.data.auth_info.profile.image + `?${$page.data.auth_info.profile.image_ver}`} alt="input profile" bind:this={image}>
					</label>
				</td>
			</tr>
			<tr>
				<td>{$_("settings.profile_picture")}:</td>
				<td>
					<input
						type="file"
						name="profile_picture"
						accept="image/*"
						id="imageSelect"
						bind:this={imageInput}
						onchange={imageChange}
						autocomplete="off"
						disabled={inFlight}
					/>
				</td>
			</tr>
		</tbody>
	</table>
	<table>
		<tbody>
			<tr>
				<td style:min-width="unset">
					<input
						type="submit"
						style="padding: 2px 10px;"
						value={$_("settings.save")}
						disabled={
							!imageHasChanged ||
							inFlight
						}
					/>
				</td>
			</tr>
		</tbody>
	</table>
</form>

{@render flightPopup(inFlight, "info.saving", $_("info.saving"))} <!-- madness -->
{@render resultPopup(formRes, $page.route.id)}

<style>
	td {
		padding-top: 4px;
		position: relative;
	}
	img {
		outline: 2px solid var(--unfocused_border);
		width: 100%;
		max-width: 350px;
		border-radius: var(--border_radius);
		transition: outline var(--transition);
	}
	img:hover {
		outline-color: var(--accent);
	}
</style>
