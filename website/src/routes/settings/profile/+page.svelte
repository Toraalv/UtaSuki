<script>
	import SwayWindow from "$lib/SwayWindow.svelte";
	import Alert from "$lib/Alert.svelte";
	import AnimatedDots from "$lib/AnimatedDots.svelte";
	import TextCounter from "$lib/TextCounter.svelte";
	import { setLang } from "$lib/helpers.js";
	import { PFP_PATH, LEN_LIMITS } from "$lib/globals.js";
	import { inputWarning, flightPopup, resultPopup } from "../snippets.svelte";

	import { page } from "$app/stores";
	import { enhance } from "$app/forms";
	import { _, locale, locales } from "svelte-i18n";
	import CodeMirror from "svelte-codemirror-editor";
	import { markdown } from "@codemirror/lang-markdown";
	import { oneDark } from "@codemirror/theme-one-dark";

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
				// TODO: warn user too big file
				image.setAttribute("src", reader.result);
				imageHasChanged = true;
			});
			reader.readAsDataURL(file);
			return;
		}
	}

	// form feedback
	let codemirror = $state($page.data.auth_info.profile.description);
	let descriptionLen = $state($page.data.auth_info.profile.description.length);
	console.log("desc len: " + descriptionLen);
	let descriptionErr = $derived(descriptionLen > LEN_LIMITS.USER_DESC);

	let descriptionPaddingCheckbox = $state($page.data.auth_info.profile.description_padding);
	let descriptionCenterCheckbox = $state($page.data.auth_info.profile.description_center);

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
						<img src={`${PFP_PATH}/${$page.data.auth_info.profile.image}?${$page.data.auth_info.profile.image_ver}`} alt="input profile" bind:this={image}>
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
			<tr>
				<td title={$_("settings.description_padding_title")}><label for="description_padding">{$_("settings.description_padding")}:</label></td>
				<td>
					<input
						id="description_padding"
						type="checkbox"
						bind:checked={descriptionPaddingCheckbox}
						disabled={inFlight}
						autocomplete="off"
					/>
					<input type="hidden" name="description_padding" value={descriptionPaddingCheckbox ? 1 : 0}>
				</td>
			</tr>
			<tr>
				<td title={$_("settings.description_center_title")}><label for="description_center">{$_("settings.description_center")}:</label></td>
				<td>
					<input
						id="description_center"
						type="checkbox"
						bind:checked={descriptionCenterCheckbox}
						disabled={inFlight}
						autocomplete="off"
					/>
					<input type="hidden" name="description_center" value={descriptionCenterCheckbox ? 1 : 0}>
				</td>
			</tr>
			<tr>
				<td>{$_("settings.description")}:</td>
			</tr>
		</tbody>
	</table>
	<div style="position: relative;">
		<CodeMirror
			bind:value={codemirror}
			lang={markdown()}
			theme={oneDark}
			foldGutter=false
			tabSize=4
			closeBrackets=false
			lineWrapping=true
			autocompletion=false
			onchange={(cm) => descriptionLen = cm.length + cm.split('\n').length - 1}
			styles={{
				"&": {
					backgroundColor: "#111111",
					width: "100%",
					maxWidth: "100%",
					height: "30vh",
					fontSize: "14px"
				},
			}}

		/>
		<TextCounter style="padding-top: 4px; height: initial;" length={descriptionLen} error={descriptionErr} maxLength={LEN_LIMITS.USER_DESC}/>
		{@render inputWarning(descriptionErr, $_("warning.too_long"))}
	</div>
	<span onclick={() => console.log(codemirror.length + codemirror.split('\n').length)} style="color: var(--d2_text); font-size: 10pt;"><i>{$_("settings.markdown")}</i></span>
	<input type="hidden" name="description" value={codemirror}>
	<table>
		<tbody>
			<tr>
				<td style:min-width="unset">
					<input
						type="submit"
						style="padding: 2px 10px;"
						value={$_("settings.save")}
						disabled={
							!imageHasChanged &&
							descriptionPaddingCheckbox == $page.data.auth_info.profile.description_padding &&
							descriptionCenterCheckbox == $page.data.auth_info.profile.description_center &&
							codemirror == $page.data.auth_info.profile.description ||
							inFlight ||
							descriptionErr
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
	/* TODO: show line numbers */
	textarea {
		font-size: 10pt;
		resize: vertical;
	}
	input[type="checkbox"] {
		width: auto;
	}
</style>
