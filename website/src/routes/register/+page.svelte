<script>
	import SwayWindow from "$lib/SwayWindow.svelte";
	import Alert from "$lib/Alert.svelte";
	import AnimatedDots from "$lib/AnimatedDots.svelte";
	import TextCounter from "$lib/TextCounter.svelte";
	import { CDN_ADDR, LEN_LIMITS } from "$lib/globals.js";

	import { page } from "$app/stores";
	import { goto } from "$app/navigation";
	import { enhance } from "$app/forms";
	import { _ } from "svelte-i18n";

	let { form } = $props();

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

	let registerForm = $state();
	let popupTimerID = $state();
	let popup = $state();
	let hidePopup = () => {
		if (popup != null) {
			if (form.code.split('.')[0] == "success") {
				image.setAttribute("src", "/empty_profile_picture.webp");
				imageHasChanged = false;
				registerForm.reset();
				goto("/");
			}
			popup.style.display = "none";
			clearTimeout(popupTimerID);
		}
	};
	let popupTimer = () => popupTimerID = setTimeout(() => hidePopup(), 3500);

	// form feedback
	let usernameInputVal = $state("");
	let usernameErr = $derived(usernameInputVal.length > LEN_LIMITS.USERNAME);

	let emailInputVal = $state("");
	let emailErr = $derived(emailInputVal.length > LEN_LIMITS.EMAIL);

	let passwordInputVal = $state("");
	let passwordErr = $derived(passwordInputVal.length > LEN_LIMITS.PASSWORD);

	let inFlight = $state(false);
</script>

{#snippet inputWarning(err, code)}
	{#if err}
		<tr>
			<td style="padding-top: 0; color: var(--warning)">{$_(code)}</td>
		</tr>
	{/if}
{/snippet}

<SwayWindow contentStyle="padding: 20px; display: flex; justify-content: center;" title={$_("general.register_noun")}>
	<form
		method="POST"
		enctype="multipart/form-data"
		action="?/register"
		bind:this={registerForm}
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
				<img src="/empty_profile_picture.webp" alt="profile" bind:this={image}>
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
			<div style="flex-direction: column; padding-left: 20px; justify-content: space-between;">
				<table>
					<tbody>
						<tr>
							<td>{$_("general.username")}:</td>
						</tr>
						<tr>
							<td>
								<input
									type="text"
									name="username"
									autocomplete="off"
									maxlength={LEN_LIMITS.USERNAME}
									bind:value={usernameInputVal}
									disabled={inFlight}
									required
								/>
								<TextCounter style="padding-top: 4px;" inputVal={usernameInputVal} error={usernameErr} maxLength={LEN_LIMITS.USERNAME}/>
							</td>
						</tr>
						{@render inputWarning(usernameErr, "warning.too_long")}
						<tr>
							<td>{$_("general.email")}:</td>
						</tr>
						<tr>
							<td>
								<input
									type="text"
									name="email"
									autocomplete="off"
									maxlength={LEN_LIMITS.EMAIL}
									bind:value={emailInputVal}
									disabled={inFlight}
									required
								/>
								<TextCounter style="padding-top: 4px;" inputVal={emailInputVal} error={emailErr} maxLength={LEN_LIMITS.EMAIL}/>
							</td>
						</tr>
						{@render inputWarning(emailErr, "warning.too_long")}
						<tr>
							<td>{$_("general.password")}:</td>
						</tr>
						<tr>
							<td style="position: relative;">
								<input
									type="password"
									name="password"
									autocomplete="off"
									maxlength={LEN_LIMITS.PASSWORD}
									bind:value={passwordInputVal}
									disabled={inFlight}
									required
								/>
								<TextCounter style="padding-top: 4px;" inputVal={passwordInputVal} error={passwordErr} maxLength={LEN_LIMITS.PASSWORD}/>
							</td>
						</tr>
						{@render inputWarning(passwordErr, "warning.too_long")}
					</tbody>
				</table>
				<input
					type="submit"
					style="padding: 2.66px 1px; font-size: 18px;"
					value={$_("general.register_verb")}
					disabled={
						inFlight ||
						!usernameInputVal.length ||
						!emailInputVal.length ||
						!passwordInputVal.length ||
						!imageHasChanged ||
						usernameErr ||
						emailErr ||
						passwordErr
					}
				/>
			</div>
		</div>
	</form>

	{#if inFlight}
		<div class="overlay" style:cursor="unset">
			<div style="position: absolute; top: 45%; left: 50%; transform: translate(-50%, -100%); z-index: 2;">
				<Alert code="info.registering" mainStyle="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -100%); z-index: 2; min-width: 15vw;">
					<p>{$_("info.registering")}</p><AnimatedDots/>
				</Alert>
			</div>
		</div>
	{/if}
	{#if form}
		<a bind:this={popup} use:popupTimer class="overlay" onclick={() => hidePopup()} href={$page.status != 200 ? "/register" : "/"}>
			<div style="position: absolute; top: 45%; left: 50%; transform: translate(-50%, -100%); z-index: 2;">
				<Alert code={form.code} mainStyle="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -100%); z-index: 2; min-width: 20vw;"/>
			</div>
		</a>
	{/if}
</SwayWindow>


<style>
	label {
		width: 300px;
		border-radius: var(--border_radius);
	}
	label:focus { outline: none; }
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
	td {
		padding-top: 4px;
		position: relative;
	}
</style>
