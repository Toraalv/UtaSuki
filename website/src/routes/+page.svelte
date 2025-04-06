<script>
	import SwayWindow from "$lib/SwayWindow.svelte";
	import LinkButton from "$lib/LinkButton.svelte";
	import ControlPanel from "$lib/ControlPanel.svelte";
	import Profile from "$lib/Profile.svelte";
	import Footer from "$lib/Footer.svelte";
	import Alert from "$lib/Alert.svelte";
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

	let redirectTimeoutID = $state();
	let redirectTimeout = () => redirectTimeoutID = setTimeout(() => goto('/'), 3500);

	// form feedback
	let emailInputVal = $state("");
	let emailErr = $derived(encodeURIComponent(emailInputVal).length > LEN_LIMITS.EMAIL);

	let usernameInputVal = $state("");
	let usernameErr = $derived(encodeURIComponent(usernameInputVal).length > LEN_LIMITS.USERNAME);

	let passwordInputVal = $state("");
	let passwordErr = $derived(encodeURIComponent(passwordInputVal).length > LEN_LIMITS.PASSWORD);
</script>

<!-- it would be nice to put these in a seperate file and export multiple snippets but due to bug or limitation of svelte, exporting a snippet that begins with a table element does not work -->
{#snippet textCounter(inputVal, err, MAX_LEN)}
	<p style="position: absolute; top: 0; right: 0; margin: 0 10px; padding-top: 4px; height: 100%; align-content: center; {`color: var(--${err ? "warning" : "d2_text"});`}">{MAX_LEN - encodeURIComponent(inputVal).length}</p>
{/snippet}

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
				<form style="display: flex" method="POST" action="?/login" use:enhance>
					<table style="flex-grow: 1">
						<tbody>
							<tr>
								<td>{$_("general.email")}:</td>
							</tr>
							<tr>
								<td>
									<input type="email" name="email" autocomplete="off" required>
								</td>
							</tr>
							<tr>
								<td>{$_("general.password")}:</td>
							</tr>
							<tr>
								<td>
									<input type="password" name="password" autocomplete="off" required>
								</td>
							</tr>
							<tr>
								<td>
									<input type="submit" value={$_("general.login_verb")}>
								</td>
							</tr>
						</tbody>
					</table>
				</form>
				{#if form?.type == "login" && form?.res.code.split('.')[0] != "success"}
					<Alert code={form.res.code} mainStyle="margin-top: 10px;"/> <!-- margin matches sway_content's padding -->
				{/if}
			</SwayWindow>
			<!---- REGISTRATION FORM ---->
			<SwayWindow title={$_("general.register_noun")} mainStyle="min-width: 300px; max-width: 300px; flex-grow: 1">
				<form onsubmit={() => { showImage = false; redirectTimeout(); }} style="display: flex;" enctype="multipart/form-data" action="?/register" method="POST" use:enhance>
					<table style="flex-grow: 1">
						<tbody>
							<tr>
								<td>{$_("general.profile_picture")}:</td>
							</tr>
							<tr>
								<td>
									<label for="imageSelect">
										<img style={`display: ${showImage ? "block" : "none"}`} src="" alt="input profile" bind:this={image}>
										<input type="file" name="file" accept="image/*" id="imageSelect" bind:this={imageInput} onchange={imageChange} autocomplete="off" required>
									</label>
								</td>
							</tr>
							<tr>
								<td>{$_("general.email")}:</td>
							</tr>
							<tr>
								<td>
									<input type="email" name="email" autocomplete="off" bind:value={emailInputVal} maxlength={LEN_LIMITS.EMAIL} required>
									{@render textCounter(emailInputVal, emailErr, LEN_LIMITS.EMAIL)}
								</td>
							</tr>
							{@render inputWarning(emailErr, "warning.too_long")}
							<tr>
								<td>{$_("general.username")}:</td>
							</tr>
							<tr>
								<td>
									<input type="text" name="username" autocomplete="off" bind:value={usernameInputVal} maxlength={LEN_LIMITS.USERNAME} required>
									{@render textCounter(usernameInputVal, usernameErr, LEN_LIMITS.USERNAME)}
								</td>
							</tr>
							{@render inputWarning(usernameErr, "warning.too_long")}
							<tr>
								<td>{$_("general.password")}:</td>
							</tr>
							<tr>
								<td>
									<input type="password" name="password" autocomplete="off" bind:value={passwordInputVal} maxlength={LEN_LIMITS.PASSWORD} required>
									{@render textCounter(passwordInputVal, passwordErr, LEN_LIMITS.PASSWORD)}
								</td>
							</tr>
							{@render inputWarning(passwordErr, "warning.too_long")}
							<tr>
								<td>
									<input type="submit" value={$_("general.register_verb")} >
								</td>
							</tr>
						</tbody>
					</table>
				</form>
				<!-- popups when registering -->
				{#if form?.type == "register" && form?.res}
					<a onclick={() => clearTimeout(redirectTimeoutID)} href="/">
						<Alert code={form.res.code} mainStyle="margin-top: 10px;"/> <!-- margin matches sway_content's padding -->
					</a>
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
			<a href="/{user.uid}">
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
