<script>
	import SwayWindow from "$lib/SwayWindow.svelte";
	import LinkButton from "$lib/LinkButton.svelte";
	import ControlPanel from "$lib/ControlPanel.svelte";
	import Profile from "$lib/Profile.svelte";
	import Footer from "$lib/Footer.svelte";
	import Alert from "$lib/Alert.svelte";

	import { goto } from "$app/navigation";
	import { page } from "$app/stores";
	import { enhance } from "$app/forms";
	import { _ } from "svelte-i18n";

	let { form } = $props();

	let imageInput = $state();
	let image = $state();
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

<div style="display: flex; flex-direction: column; justify-content: space-between; height: 100vh; margin: 0; padding: 0;">
	{#if $page.data.res.code.split('.')[0] == "error"}
		<SwayWindow title={$_("general.login_noun")} mainStyle="max-width: 300px; min-width: 300px; flex: 1;" contentStyle="display: flex; flex-direction: column; flex-grow: 1; justify-content: space-between">
			<!-- <Alert mainStyle="flex-grow: 0" code="{$page.data.res.code}"/> --> <!-- maybe there's no need for an alert here? -->
		</SwayWindow>
	{:else}
		{#if $page.data.res.auth_info.authed}
			<!---- CONTROL PANEL ---->
			<ControlPanel/>
		{:else}
			<!---- LOGIN FORM ---->
			<SwayWindow title={$_("general.login_noun")} mainStyle="max-width: 300px; min-width: 300px; flex-grow: 0;">
				<form style="display: flex" method="POST" action="?/login" use:enhance>
					<table cellpadding="5" cellspacing="0" style="flex-grow: 1">
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
				{#if form?.type == "login" && form?.res.code.split('.')[0] == "error"}
					<Alert code={form.res.code}/>
				{/if}
			</SwayWindow>
			<!---- REGISTRATION FORM ---->
			<SwayWindow title={$_("general.register_noun")} mainStyle="max-width: 300px; min-width: 300px; flex: 1">
				<form style="display: flex;" enctype="multipart/form-data" action="?/register" method="POST" use:enhance>
					<table cellpadding="5" cellspacing="0" style="flex-grow: 1">
						<tbody>
							<tr>
								<td>{$_("general.profile_picture")}:</td>
							</tr>
							<tr>
								<td>
									<label for="imageSelect">
										<img src="/empty_profile_picture.webp" alt="input profile" bind:this={image}>
										<input type="file" name="file" accept="image/*" id="imageSelect" bind:this={imageInput} onchange={imageChange} required>
									</label>
								</td>
							</tr>

							<tr>
								<td>{$_("general.email")}:</td>
							</tr>
							<tr>
								<td>
									<input type="email" name="email" autocomplete="off" required>
								</td>
							</tr>

							<tr>
								<td>{$_("general.username")}:</td>
							</tr>
							<tr>
								<td>
									<input type="text" name="username" autocomplete="off" required>
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
									<input type="submit" value={$_("general.register_verb")} onclick={() => {image.setAttribute("src", "/empty_profile_picture.webp"); setTimeout(() => goto("/"), 2500)}}>
								</td>
							</tr>
						</tbody>
					</table>
				</form>
				{#if form?.type == "register" && form?.res.code.split('.')[0] == "error"}
					<Alert code={form.res.code}/>
				{/if}
			</SwayWindow>
		{/if}
	{/if}
	<!---- ABOUT ---->
	<Footer/>
</div>

<!-- popup when registering -->
{#if form?.type == "register" && form?.res}
	<a href="/">
		<div class="overlay"></div>
		<Alert code={form.res.code} mainStyle="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -100%); z-index: 2"/>
	</a>
{/if}

<SwayWindow title={$_("general.user_profiles")} altTitle={$_("general.user_profiles+")}>
	{#if $page.data.res.code.split('.')[0] == "error"}
		<Alert code={$page.data.res.code}/>
	{:else}
		{#each $page.data.res.data as user}
			<a href="/{user.uid}">
				<Profile username={user.username} image={user.image} created={new Date(user.created)} activity={new Date(user.last_activity)}/>
			</a>
		{/each}
	{/if}
</SwayWindow>

<style>
	input[type="file"] {
		display: none;
	}
	label > img {
		border: 1px solid var(--unfocused_border);
		object-fit: contain;
		width: 100%;
		max-height: 400px;
	}

	label > img:hover {
		outline: 1px solid var(--border);
	}
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
</style>
