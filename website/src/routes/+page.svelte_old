<script>
	import SwayWindow from "$lib/SwayWindow.svelte";
	import LinkButton from "$lib/LinkButton.svelte";
	import ControlPanel from "$lib/ControlPanel.svelte";
	import Profile from "$lib/Profile.svelte";
	import Footer from "$lib/Footer.svelte";
	import Alert from "$lib/Alert.svelte";
	import AnimatedDots from "$lib/AnimatedDots.svelte";
	import TextCounter from "$lib/TextCounter.svelte";
	import { LEN_LIMITS } from "$lib/globals.js";

	import { goto } from "$app/navigation";
	import { page } from "$app/stores";
	import { enhance } from "$app/forms";
	import { _ } from "svelte-i18n";

	let { form } = $props();

	let imageInput = $state();
	let image = $state();
	let showImage = $state(false);
	function imageChange() {
		const file = imageInput.files[0];
		showImage = true;

		if (file) {
			const reader = new FileReader();
			reader.addEventListener("load", function () {
				image.setAttribute("src", reader.result);
			});
			reader.readAsDataURL(file);
			return;
		}
	}

	// login form feedback
	let loginPopup = $state();
	let hideLoginPopup = () => {
		if (loginPopup != null) {
			loginPopup.style.display = "none";
		}
	};

	let loginEmailInputVal = $state("");
	let loginPasswordInputVal = $state("");

	let loginFlight = $state(false);

	// register form feedback
	let registerForm = $state();
	let resetRegisterForm = () => {
		if (form.res.code.split('.')[0] == "success") {
			registerForm.reset();
		}
	};
	let registerPopup = $state();
	let registerPopupTimerID = $state();
	let hideRegisterPopup = (force) => {
		if (registerPopup != null) {
			if (force)
				registerPopup.style.display = "none";
			if (form.res.code.split('.')[0] == "success")
				registerPopup.style.display = "none";
		}
	};
	let registerPopupTimer = () => {
		if (form.res.code.split('.')[0] != "error")
			registerPopupTimerID = setTimeout(() => hideRegisterPopup(), 3500)
	};

	let registerEmailInputVal = $state("");
	let emailErr = $derived(encodeURIComponent(registerEmailInputVal).length > LEN_LIMITS.EMAIL);

	let registerUsernameInputVal = $state("");
	let usernameErr = $derived(encodeURIComponent(registerUsernameInputVal).length > LEN_LIMITS.USERNAME);

	let registerPasswordInputVal = $state("");
	let passwordErr = $derived(encodeURIComponent(registerPasswordInputVal).length > LEN_LIMITS.PASSWORD);

	let registerFlight = $state(false);
</script>

{#snippet inputWarning(err, code)}
	{#if err}
		<tr>
			<td style="padding-top: 0; color: var(--warning)">{$_(code)}</td>
		</tr>
	{/if}
{/snippet}

<!---- PAGE CONTENT ---->
<div style="display: flex; flex-direction: column; justify-content: space-between; height: 100vh; margin: 0; padding: 0;">
	{#if $page.data.code.split('.')[0] == "error"}
		<SwayWindow title={$_("general.login_noun")} mainStyle="min-width: 300px; max-width: 300px; flex: 1;" contentStyle="display: flex; flex-direction: column; flex-grow: 1; justify-content: space-between">
		</SwayWindow>
	{:else}
		{#if $page.data.auth_info.authed}
			<!---- CONTROL PANEL ---->
			<ControlPanel/>
		{:else}
			<!---- LOGIN FORM ---->
			<SwayWindow title={$_("general.login_noun")} mainStyle="min-width: 300px; max-width: 300px; flex-grow: 1;">
				<form
					style="display: flex"
					method="POST"
					action="?/login"
					onsubmit={() => { registerForm.reset(); showImage = false; hideLoginPopup() }}
					use:enhance={() => {
						loginFlight = true;

						return async ({ update }) => {
							await update({ reset: false });
							loginFlight = false;
						};
					}}
				>
					<table style="flex-grow: 1">
						<tbody>
							<tr>
								<td>{$_("general.email")}:</td>
							</tr>
							<tr>
								<td>
									<input
										type="email"
										name="email"
										bind:value={loginEmailInputVal}
										disabled={loginFlight}
										maxlength={LEN_LIMITS.EMAIL}
										autocomplete="off"
										required
									/>
								</td>
							</tr>
							<tr>
								<td>{$_("general.password")}:</td>
							</tr>
							<tr>
								<td>
									<input
										type="password"
										name="password"
										bind:value={loginPasswordInputVal}
										disabled={loginFlight}
										maxlength={LEN_LIMITS.PASSWORD}
										autocomplete="off"
										required
									/>
								</td>
							</tr>
							<tr>
								<td>
									<input
										type="submit"
										disabled={loginFlight || !loginEmailInputVal.length || !loginPasswordInputVal.length}
										value={$_("general.login_verb")}
									/>
								</td>
							</tr>
						</tbody>
					</table>
				</form>
				{#if loginFlight}
					<Alert code="info.logging_in" mainStyle="margin-top: 10px;">
						<p>{$_("info.logging_in")}</p><AnimatedDots/>
					</Alert>
				{/if}
				{#if form?.type == "login" && form?.res.code.split('.')[0] != "success"}
					<div bind:this={loginPopup} onclick={() => hideLoginPopup()}>
						<Alert code={form.res.code} mainStyle="margin-top: 10px;"/> <!-- margin matches sway_content's padding -->
					</div>
				{/if}
			</SwayWindow>
			<!---- REGISTRATION FORM ---->
			<SwayWindow title={$_("general.register_noun")} mainStyle="min-width: 300px; max-width: 300px; flex-grow: 1">
				<form
					style="display: flex;"
					enctype="multipart/form-data"
					action="?/register"
					method="POST"
					bind:this={registerForm}
					onsubmit={() => hideRegisterPopup(true)}
					onreset={() => showImage = false}
					use:enhance={() => {
						registerFlight = true;

						return async ({ update }) => {
							await update({ reset: false });
							registerFlight = false;
						};
					}}
				>
					<table style="flex-grow: 1">
						<tbody>
							<tr>
								<td>{$_("general.profile_picture")}:</td>
							</tr>
							<tr>
								<td>
									<label for="imageSelect">
										<img style={`display: ${showImage ? "block" : "none"}`} src="" alt="input profile" bind:this={image}>
										<input
											type="file"
											name="file"
											accept="image/*"
											id="imageSelect"
											bind:this={imageInput}
											disabled={registerFlight}
											onchange={imageChange}
											autocomplete="off"
											required
										/>
									</label>
								</td>
							</tr>
							<tr>
								<td>{$_("general.email")}:</td>
							</tr>
							<tr>
								<td>
									<input
										type="email"
										name="email"
										autocomplete="off"
										bind:value={registerEmailInputVal}
										disabled={registerFlight}
										maxlength={LEN_LIMITS.EMAIL}
										required
									/>
									<TextCounter style="padding-top: 4px;" inputVal={registerEmailInputVal} error={emailErr} maxLength={LEN_LIMITS.EMAIL}/>
								</td>
							</tr>
							{@render inputWarning(emailErr, "warning.too_long")}
							<tr>
								<td>{$_("general.username")}:</td>
							</tr>
							<tr>
								<td>
									<input
										type="text"
										name="username"
										autocomplete="off"
										bind:value={registerUsernameInputVal}
										disabled={registerFlight}
										maxlength={LEN_LIMITS.USERNAME}
										required
									/>
									<TextCounter style="padding-top: 4px;" inputVal={registerUsernameInputVal} error={usernameErr} maxLength={LEN_LIMITS.USERNAME}/>
								</td>
							</tr>
							{@render inputWarning(usernameErr, "warning.too_long")}
							<tr>
								<td>{$_("general.password")}:</td>
							</tr>
							<tr>
								<td>
									<input
										type="password"
										name="password"
										autocomplete="off"
										bind:value={registerPasswordInputVal}
										disabled={registerFlight}
										maxlength={LEN_LIMITS.PASSWORD}
										required
									/>
									<TextCounter style="padding-top: 4px;" inputVal={registerPasswordInputVal} error={passwordErr} maxLength={LEN_LIMITS.PASSWORD}/>
								</td>
							</tr>
							{@render inputWarning(passwordErr, "warning.too_long")}
							<tr>
								<td>
									<input
										type="submit"
										value={$_("general.register_verb")}
										disabled={
											registerFlight ||
											!registerEmailInputVal.length ||
											!registerUsernameInputVal.length ||
											!registerPasswordInputVal.length ||
											!showImage ||
											emailErr ||
											usernameErr ||
											passwordErr
										}
									/>
								</td>
							</tr>
						</tbody>
					</table>
				</form>
				<!-- popups when registering -->
				{#if registerFlight}
					<Alert code="info.registering" mainStyle="margin-top: 10px;">
						<p>{$_("info.registering")}</p><AnimatedDots/>
					</Alert>
				{/if}
				{#if form?.type == "register" && form?.res}
					<div bind:this={registerPopup} use:resetRegisterForm use:registerPopupTimer>
						<Alert code={form.res.code} mainStyle="margin-top: 10px;"/>
					</div>
				{/if}
			</SwayWindow>
		{/if}
	{/if}
	<!---- ABOUT ---->
	<Footer/>
</div>

<SwayWindow title={$_("general.user_profiles")} altTitle={$_("general.user_profiles+")}>
	{#if $page.data.code.split('.')[0] == "error"}
		<Alert code={$page.data.code}/>
	{:else}
		{#each $page.data.data as user}
			<a href="/user/{user.uid}">
				<Profile username={user.username} image={user.image} imageVer={user.image_ver} created={new Date(user.created)} activity={new Date(user.last_activity)}/>
			</a>
		{/each}
	{/if}
</SwayWindow>

<style>
	label > img {
		border: 1px solid var(--unfocused_border);
		object-fit: contain;
		width: 100%;
		max-height: 400px;
	}

	label > img:hover {
		outline: 1px solid var(--border);
	}
	td {
		padding-top: 4px;
		position: relative;
	}
</style>
