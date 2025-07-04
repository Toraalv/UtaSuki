<script>
	import SwayWindow from "$lib/SwayWindow.svelte";
	import Alert from "$lib/Alert.svelte";
	import AnimatedDots from "$lib/AnimatedDots.svelte";
	import TextCounter from "$lib/TextCounter.svelte";
	import { CDN_ADDR, LEN_LIMITS } from "$lib/globals.js";
	import { inputWarning, flightPopup, resultPopup } from "../snippets.svelte";

	import { page } from "$app/stores";
	import { enhance } from "$app/forms";
	import { _ } from "svelte-i18n";

	let { form } = $props();
	let formRes = $state(undefined);

	let publicCheckbox = $state($page.data.auth_info.profile.public);
	let notesPublicCheckbox = $derived(publicCheckbox && $page.data.auth_info.profile.notes_public);

	// form feedback
	let usernameInputVal = $state($page.data.auth_info.profile.username);
	let usernameErr = $derived(usernameInputVal.length > LEN_LIMITS.USERNAME);

	let passwordInputVal = $state("");
	let passwordErr = $derived(passwordInputVal.length > LEN_LIMITS.PASSWORD);

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
				<td>{$_("settings.username")}:</td>
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
			{@render inputWarning(usernameErr, $_("warning.too_long"))}
			<tr>
				<td>{$_("settings.password")}:</td>
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
			{@render inputWarning(passwordErr, $_("warning.too_long"))}
			<tr>
				<td title={$_("settings.public_title")}>{$_("settings.public")}:</td>
				<td>
					<input
						type="checkbox"
						bind:checked={publicCheckbox}
						autocomplete="off"
						disabled={inFlight}
					/>
					<input type="hidden" name="public" value={publicCheckbox ? 1 : 0}>
				</td>
			</tr>
			<tr>
				<td title={$_("settings.notes_public_title")}>{$_("settings.notes_public")}:</td>
				<td>
					<input
						type="checkbox"
						bind:checked={notesPublicCheckbox}
						disabled={!publicCheckbox || inFlight}
						autocomplete="off"
					/>
					<input type="hidden" name="notes_public" value={notesPublicCheckbox ? 1 : 0}>
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
							usernameErr ||
							!usernameInputVal.length ||
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
	input[type="checkbox"] {
		width: auto;
	}
</style>
