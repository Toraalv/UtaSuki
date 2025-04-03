<script>
	import SwayWindow from "$lib/SwayWindow.svelte";
	import ControlPanel from "$lib/ControlPanel.svelte";
	import Footer from "$lib/Footer.svelte";
	import Alert from "$lib/Alert.svelte";
	import { CDN_ADDR, LEN_LIMITS } from "$lib/globals.js";

	import { page } from "$app/stores";
	import { enhance } from "$app/forms";
	import { _ } from "svelte-i18n";

	let { form } = $props();

	let publicCheckbox = $state($page.data.auth_info.profile.public);
	let notesPublicCheckbox = $state($page.data.auth_info.profile.track_notes_public);

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
			clearTimeout(popupTimerID);
		}
	};
	let popupTimer = () => popupTimerID = setTimeout(() => hidePopup(), 2000);

	// form feedback
	let usernameInputVal = $state($page.data.auth_info.profile.username);
	let usernameErr = $derived(encodeURIComponent(usernameInputVal).length > LEN_LIMITS.USERNAME);
</script>

<!-- it would be nice to put these in a seperate file and export multiple snippets but due to bug or limitation of svelte, exporting a snippet that begins with a table element does not work -->
{#snippet textCounter(inputVal, err, MAX_LEN)}
	<p style="position: absolute; top: 0; right: 0; margin: 0 10px; padding-top: 4px; height: 100%; align-content: center; {`color: var(--${err ? "warning" : "d2_text"});`}">{MAX_LEN - encodeURIComponent(inputVal).length}</p>
{/snippet}

{#snippet inputWarning(err, code)}
	{#if err}
		<tr>
			<td style="padding-top: 0;"></td>
			<td style="padding-top: 0; color: var(--warning)">{$_(code)}</td>
		</tr>
	{/if}
{/snippet}

<div style="display: flex; flex-direction: column; justify-content: space-between; height: 100vh; margin: 0; padding: 0;">
	<ControlPanel/>
	<Footer/>
</div>

<SwayWindow contentStyle="padding: 20px;" title={$_("general.settings")}>
	<form onsubmit={() => popupTimer()} method="POST" enctype="multipart/form-data" action="?/updateSettings" use:enhance={() => { return async ({ update }) => { update({ reset: false }); }; }}>
		<table>
			<tbody>
				<tr>
					<td></td>
					<td>
						<label for="imageSelect">
							<img style:object-fit="cover" src={CDN_ADDR + $page.data.auth_info.profile.image + `?${$page.data.auth_info.profile.image_ver}`} alt="input profile" bind:this={image}>
						</label>
					</td>
				</tr>
				<tr>
					<td>{$_("general.profile_picture")}:</td>
					<td>
						<input type="file" name="profile_picture" accept="image/*" id="imageSelect" bind:this={imageInput} onchange={imageChange} autocomplete="off">
					</td>
				</tr>
				<tr>
					<td>{$_("general.username")}:</td>
					<td>
						<!-- userhandle to avoid autofill -->
						<input type="text" name="userhandle" autocomplete="off" maxlength="255" bind:value={usernameInputVal}>
						{@render textCounter(usernameInputVal, usernameErr, LEN_LIMITS.USERNAME)}
					</td>
				</tr>
				{@render inputWarning(usernameErr, "warning.too_long")}
				<tr>
					<td title={$_("general.public_title")}>{$_("general.public")}:</td>
					<td>
						<input bind:checked={publicCheckbox} type="checkbox" name="public" autocomplete="off">
					</td>
				</tr>
				<!-- a really nice side effect of not showing this checkbox when the first public setting is turned
				off is that the value is considered undefined on the api, which then turns off this setting too	-->
				{#if publicCheckbox}
					<tr>
						<td title={$_("general.track_notes_public_title")}>{$_("general.track_notes_public")}:</td>
						<td>
							<input bind:checked={notesPublicCheckbox} type="checkbox" name="track_notes_public" autocomplete="off">
						</td>
					</tr>
				{/if}
			</tbody>
		</table>
		<table>
			<tbody>
				<tr>
					<td style:min-width="unset">
						<input style="padding: 2px 10px;" type="submit" value={$_("general.save")}>
					</td>
				</tr>
			</tbody>
		</table>
	</form>

	{#if form}
		<a bind:this={popup} class="overlay" onclick={() => hidePopup()} href="/settings">
			<Alert code={form.code} mainStyle="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -100%); z-index: 2"/>
		</a>
	{/if}
</SwayWindow>

<style>
	input {
		max-width: 450px;
	}
	td {
		padding-top: 4px;
		position: relative;
		min-width: 200px;
	}
	input[type="checkbox"] {
		width: auto;
	}
	img {
		border: 1px solid var(--unfocused_border);
		width: 100%;
		max-width: 450px;
		height: 300px;
	}
	img:hover {
		outline: 1px solid var(--border);
	}
</style>
