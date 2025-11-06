<script>
	import SwayWindow from "$lib/SwayWindow.svelte";
	import Alert from "$lib/Alert.svelte";
	import AnimatedDots from "$lib/AnimatedDots.svelte";
	import TextCounter from "$lib/TextCounter.svelte";
	import { setLang } from "$lib/helpers.js";
	import { CDN_ADDR, LEN_LIMITS } from "$lib/globals.js";
	import { inputWarning, flightPopup, resultPopup } from "../snippets.svelte";

	import { page } from "$app/stores";
	import { enhance } from "$app/forms";
	import { _, locale, locales } from "svelte-i18n";
	import { onMount } from "svelte";

	let defaultAccent = $state();
	let defaultAccentText = $state();
	let defaultDarkText = $state();
	// the accent placeholder will flash a little but that's better than hardcoded values
	onMount(() => {
		defaultAccent = getComputedStyle(document.documentElement).getPropertyValue("--default_accent");
		defaultAccentText = getComputedStyle(document.documentElement).getPropertyValue("--default_accent_text");
		defaultDarkText = getComputedStyle(document.documentElement).getPropertyValue("--default_dark_text");
	})

	let { form, data } = $props();
	let formRes = $state(undefined);

	let bkgInput = $state();
	let bkg = $state();
	let removeBkg = $state(false);
	function bkgChange() {
		removeBkg = false;
		const file = bkgInput.files[0];

		if (file) {
			const reader = new FileReader();
			reader.addEventListener("load", (event) => {
				// warn user too big file
				bkg.setAttribute("src", reader.result);
			});
			reader.readAsDataURL(file);
			return;
		}
	}

	let borderRadiusCheckbox = $state($page.data.auth_info.profile.border_radius);
	let bodyMarginCheckbox = $state($page.data.auth_info.profile.body_margin);
	let animationsCheckbox = $state($page.data.auth_info.profile.animations);

	const hexRegex = /^#[0-9A-F]{6}$/i;
	let userAccent = $page.data.auth_info.profile.accent;
	let accentInputVal = $state(userAccent);
	let accentPicker = $derived(userAccent == "" ? defaultAccent : userAccent);
	let accentErr = $derived(accentInputVal.length > LEN_LIMITS.HEX_COLOR);

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
			bkgInput.value = null;
			removeBkg = false;
		};
	}}
>
	<table>
		<tbody>
			<tr>
				<td></td>
				<td>
					<label for="bkgSelect">
						<img src={$page.data.auth_info.profile.bkg == null ? "/background_placeholder.png" : `${CDN_ADDR + $page.data.auth_info.profile.bkg}?${$page.data.auth_info.profile.bkg_ver}`} alt="input background" bind:this={bkg}>
					</label>
				</td>
			</tr>
			<tr>
				<td>{$_("settings.background_img")}:</td>
				<td>
					<input
						type="file"
						name="background_img"
						accept="image/*"
						id="bkgSelect"
						bind:this={bkgInput}
						onchange={bkgChange}
						autocomplete="off"
						disabled={inFlight}
					/>
				</td>
			</tr>
			<tr>
				<td>{$_("settings.opacity")}:</td>
				<td>
					<input
						type="range"
						min="0"
						max="100"
						value={$page.data.auth_info.profile.opacity}
						name="opacity"
						oninput={(_this) => document.documentElement.style.setProperty("--opacity", _this.srcElement.value / 100)}
					/>
				</td>
			</tr>
			<tr>
				<td></td>
				<td>
					<input
						type="button"
						name="remove_bkg"
						value={$_("settings.remove_background")}
						id="removeBkg"
						onclick={() => { bkg.setAttribute("src", "/background_placeholder.png"); removeBkg = true }}
						disabled={inFlight}
					/>
				</td>
			</tr>
			<tr style:height="10px">
			</tr>
			<tr>
				<td>{$_("settings.language")}:</td>
				<td style="display: flex; flex-direction: row;">
					{#each $locales as availLocale}
						<div style:margin-right="20px">
							<input
								type="radio"
								name="language"
								value={availLocale}
								id={availLocale}
								disabled={inFlight}
								onclick={(_this) => setLang(_this.srcElement.value)}
								checked={$locale == availLocale && true}
							/>
							<label for={availLocale}>{$_(`settings.${availLocale}`)}</label>
						</div>
					{/each}
				</td>
			</tr>
			<tr>
				<td title={$_("settings.border_radius_title")}><label for="borderRadius">{$_("settings.border_radius")}:</label></td>
				<td>
					<input
						id="borderRadius"
						type="checkbox"
						bind:checked={borderRadiusCheckbox}
						onclick={(_this) => { document.documentElement.style.setProperty('--border_radius', _this.target.checked ? "var(--default_border_radius)" : 0) }}
						disabled={inFlight}
						autocomplete="off"
					/>
					<input type="hidden" name="border_radius" value={borderRadiusCheckbox ? 1 : 0}>
				</td>
			</tr>
			<tr>
				<td title={$_("settings.body_margin_title")}><label for="bodyMargin">{$_("settings.body_margin")}:</label></td>
				<td>
					<input
						id="bodyMargin"
						type="checkbox"
						bind:checked={bodyMarginCheckbox}
						onclick={(_this) => { document.documentElement.style.setProperty('--body_margin', _this.target.checked ? "var(--default_body_margin)" : 0) }}
						disabled={inFlight}
						autocomplete="off"
					/>
					<input type="hidden" name="body_margin" value={bodyMarginCheckbox ? 1 : 0}>
				</td>
			</tr>
			<tr>
				<td title={$_("settings.accent_title")}>{$_("settings.accent")}:</td>
				<td style="display: flex;">
					<input
						style="width: 2rem; height: auto; margin-right: 1px;"
						type="color"
						bind:value={accentPicker}
						oninput={(_this) => { document.documentElement.style.setProperty('--accent', _this.target.value); accentInputVal = _this.target.value }}
						autocomplete="off"
						disabled={inFlight}
					/>
					<input
						type="text"
						name="accent"
						autocomplete="off"
						maxlength={LEN_LIMITS.HEX_COLOR}
						bind:value={accentInputVal}
						placeholder={defaultAccent}
						oninput={(_this) => { document.documentElement.style.setProperty('--accent', hexRegex.test(_this.target.value) ? _this.target.value : "var(--default_accent)"); accentPicker = hexRegex.test(_this.target.value) ? _this.target.value : defaultAccent }}
						disabled={inFlight}
					/>
					<TextCounter style="padding-top: 4px;" inputVal={accentInputVal} error={accentErr} maxLength={LEN_LIMITS.HEX_COLOR}/>
				</td>
			</tr>
			{@render inputWarning(accentErr, $_("warning.too_long"))}
			<tr>
				<td title={$_("settings.accent_text_title")}>{$_("settings.accent_text")}:</td>
				<td style="display: flex; flex-direction: row;">
					<div style:margin-right="20px">
						<input
							type="radio"
							name="accent_text"
							id="lightText"
							value={defaultAccentText}
							disabled={inFlight}
							onclick={(_this) => { document.documentElement.style.setProperty('--accent_text', _this.target.value) }}
							checked={$page.data.auth_info.profile.accent_text == defaultAccentText}
						/>
						<label for="lightText">{$_("settings.light_text")}</label>
					</div>
					<div style:margin-right="20px">
						<input
							type="radio"
							name="accent_text"
							id="darkText"
							value={defaultDarkText}
							disabled={inFlight}
							onclick={(_this) => { document.documentElement.style.setProperty('--accent_text', _this.target.value) }}
							checked={$page.data.auth_info.profile.accent_text == defaultDarkText}
						/>
						<label for="darkText">{$_("settings.dark_text")}</label>
					</div>
				</td>
			</tr>
			<tr>
				<td title={$_("settings.animations_title")}><label for="animations">{$_("settings.animations")}:</label></td>
				<td>
					<input
						id="animations"
						type="checkbox"
						bind:checked={animationsCheckbox}
						onclick={(_this) => { document.documentElement.style.setProperty('--transition', _this.target.checked ? "var(--default_transition)" : 0) }}
						disabled={inFlight}
						autocomplete="off"
					/>
					<input type="hidden" name="animations" value={animationsCheckbox ? 1 : 0}>
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
							accentErr ||
							(accentInputVal.length != 0 && !hexRegex.test(accentInputVal)) ||
							inFlight
						}
					/>
				</td>
			</tr>
		</tbody>
	</table>
	<input type="hidden" name="remove_bkg" value={removeBkg}>
</form>

{@render flightPopup(inFlight, "info.saving", $_("info.saving"))} <!-- madness -->
{@render resultPopup(formRes, $page.route.id)}

<style>
	input[type="text"] {
		padding-right: 0;
	}
	td {
		padding-top: 4px;
		position: relative;
	}
	input[type="checkbox"] {
		width: auto;
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
	#removeBkg:hover {
		background-color: #561111;
	}
</style>
