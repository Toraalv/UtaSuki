<script>
	import SwayWindow from "$lib/SwayWindow.svelte";
	import LinkButton from "$lib/LinkButton.svelte";
	import ControlPanel from "$lib/ControlPanel.svelte";
	import Profile from "$lib/Profile.svelte";
	import Footer from "$lib/Footer.svelte";
	import Alert from "$lib/Alert.svelte";

	import { page } from "$app/stores";
	import { enhance } from "$app/forms";
	import { _ } from "svelte-i18n";

	let { form } = $props();
</script>

<div style="display: flex; flex-direction: column; justify-content: space-between; height: 100vh; margin: 0; padding: 0;">
	{#if $page.data.res.error}
		<SwayWindow title={$_("general.login_noun")} mainStyle="max-width: 300px; min-width: 300px; flex: 1;" contentStyle="display: flex; flex-direction: column; flex-grow: 1; justify-content: space-between">
			<!-- <Alert mainStyle="flex-grow: 0" severity="{$page.data.res.error.severity}" code="{$page.data.res.error.code}"/> --> <!-- maybe there's no need for an alert here? -->
		</SwayWindow>
	{:else}
		{#if $page.data.res.auth_info.authed}
			<!---- CONTROL PANEL ---->
			<ControlPanel/>
		{:else}
			<!---- LOGIN FORM ---->
			<SwayWindow title={$_("general.login_noun")} mainStyle="max-width: 300px; min-width: 300px; flex: 1">
				<form style="display: flex" method="POST" action="?/login" use:enhance>
					<table cellpadding="5" cellspacing="0" style="flex-grow: 1">
						<tbody>
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
									<input type="submit" value={$_("general.login_verb")}>
								</td>
							</tr>
						</tbody>
					</table>
				</form>
				{#if form?.res.error}
					<Alert severity={form.res.error.severity} code={form.res.error.code}/>
				{/if}
			</SwayWindow>
			<!---- REGISTRATION FORM ---->
			<SwayWindow title={$_("general.register_noun")} mainStyle="max-width: 300px; min-width: 300px; flex: 1">
				<form style="display: flex" action="?/register" method="POST" use:enhance>
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
									<input type="submit" value={$_("general.register_verb")} onclick={() => alert($_("warning.WIP"))}>
								</td>
							</tr>
						</tbody>
					</table>
				</form>
			</SwayWindow>
		{/if}
	{/if}
	<!---- ABOUT ---->
	<Footer/>
</div>

<SwayWindow title={$_("general.user_profiles")} altTitle={$_("general.user_profiles+")}>
	{#if $page.data.res.error}
		<Alert severity={$page.data.res.error.severity} code={$page.data.res.error.code}/>
	{:else}
		{#each $page.data.res.data as user}
			<a href="/{user.username}">
				<Profile username={user.username} image={user.image} created={new Date(user.created)} activity={new Date(user.last_activity)}/>
			</a>
		{/each}
	{/if}
</SwayWindow>
