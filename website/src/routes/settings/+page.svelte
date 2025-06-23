<script>
	import SwayWindow from "$lib/SwayWindow.svelte";
	import ControlPanel from "$lib/ControlPanel.svelte";
	import Footer from "$lib/Footer.svelte";
	import Alert from "$lib/Alert.svelte";
	import AnimatedDots from "$lib/AnimatedDots.svelte";
	import TextCounter from "$lib/TextCounter.svelte";
	import { setLang } from "$lib/helpers.js";
	import { CDN_ADDR, LEN_LIMITS } from "$lib/globals.js";

	import { page } from "$app/stores";
	import { enhance } from "$app/forms";
	import { _, locale, locales } from "svelte-i18n";

	let { form } = $props();

	let publicCheckbox = $state($page.data.auth_info.profile.public);
	let notesPublicCheckbox = $derived(publicCheckbox && $page.data.auth_info.profile.track_notes_public);

	let imageInput = $state();
	let image = $state();
	function imageChange() {
		const file = imageInput.files[0];

		if (file) {
			const reader = new FileReader();
			reader.addEventListener("load", (event) => {
				// warn user too big file
				image.setAttribute("src", reader.result);
			});
			reader.readAsDataURL(file);
			return;
		}
	}

	let popupTimerID = $state();
	let popup = $state();
	let hidePopup = () => {
		if (popup != null) {
			popup.style.display = "none";
			imageInput.value = "";
			clearTimeout(popupTimerID);
		}
	};
	let popupTimer = () => popupTimerID = setTimeout(() => hidePopup(), 2000);

	// form feedback
	let usernameInputVal = $state($page.data.auth_info.profile.username);
	let usernameErr = $derived(encodeURIComponent(usernameInputVal).length > LEN_LIMITS.USERNAME);

	let passwordInputVal = $state("");
	let passwordErr = $derived(encodeURIComponent(passwordInputVal).length > LEN_LIMITS.PASSWORD);

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

<SwayWindow contentStyle="padding: 20px; display: flex; justify-content: center;" title={$_("general.settings")}>
	<form
		method="POST"
		enctype="multipart/form-data"
		action="?/updateSettings"
		use:enhance={() => {
			inFlight = true;

			return async ({ update }) => {
				await update({ reset: false });
				inFlight = false;
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
					<td>{$_("general.profile_picture")}:</td>
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
					<td>{$_("general.username")}:</td>
					<td>
						<!-- userhandle to avoid autofill -->
						<input
							type="text"
							name="userhandle"
							autocomplete="off"
							maxlength={LEN_LIMITS.USERNAME}
							bind:value={usernameInputVal}
							disabled={inFlight}
						/>
						<TextCounter style="padding-top: 4px;" inputVal={usernameInputVal} error={usernameErr} maxLength={LEN_LIMITS.USERNAME}/>
					</td>
				</tr>
				{@render inputWarning(usernameErr, "warning.too_long")}
				<tr>
					<td>{$_("general.password")}:</td>
					<td>
						<input
							type="password"
							name="password"
							autocomplete="off"
							maxlength={LEN_LIMITS.PASSWORD}
							bind:value={passwordInputVal}
							disabled={inFlight}
						/>
						<TextCounter style="padding-top: 4px;" inputVal={passwordInputVal} error={passwordErr} maxLength={LEN_LIMITS.PASSWORD}/>
					</td>
				</tr>
				{@render inputWarning(passwordErr, "warning.too_long")}
				<tr>
					<td title={$_("general.public_title")}>{$_("general.public")}:</td>
					<td>
						<input
							type="checkbox"
							name="public"
							bind:checked={publicCheckbox}
							autocomplete="off"
							disabled={inFlight}
						/>
					</td>
				</tr>
				<tr>
					<td title={$_("general.track_notes_public_title")}>{$_("general.track_notes_public")}:</td>
					<td>
						<input
							type="checkbox"
							name="track_notes_public"
							bind:checked={notesPublicCheckbox}
							disabled={!publicCheckbox || inFlight}
							autocomplete="off"
						/>
					</td>
				</tr>
				<tr>
					<td>{$_("general.language")}:</td>
					<td style="display: flex; flex-direction: row;">
						{#each $locales as availLocale}
							<div style:margin-right="20px">
								<input
									type="radio"
									name="language"
									value={availLocale}
									id={availLocale}
									disabled={inFlight}
									onclick={(_this) => setLang(_this.srcElement.value)} checked={$locale == availLocale && true}
								/>
								<label for={availLocale}>{$_(`general.${availLocale}`)}</label>
							</div>
						{/each}
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
							value={$_("general.save")}
							disabled={usernameErr || !usernameInputVal.length || inFlight}
						/>
					</td>
				</tr>
			</tbody>
		</table>
	</form>

	{#if inFlight}
		<div class="overlay" style:cursor="unset">
			<Alert code="info.saving" mainStyle="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -100%); z-index: 2; min-width: 15vw;">
				<p>{$_("info.saving")}</p><AnimatedDots/>
			</Alert>
		</div>
	{/if}
	{#if form}
		<a bind:this={popup} use:popupTimer class="overlay" onclick={() => hidePopup()} href="/settings">
			<Alert code={form.code} mainStyle="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -100%); z-index: 2"/>
		</a>
	{/if}
</SwayWindow>

<style>
	input {
		max-width: 350px;
	}
	input:disabled {
	}
	td {
		padding-top: 4px;
		position: relative;
		min-width: 270px;
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
		outline-color: var(--border);
	}
</style>
