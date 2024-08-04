<script>
	import { page } from "$app/stores";
	import { enhance } from "$app/forms";
	import SwayWindow from "$lib/SwayWindow.svelte";
	import Profile from "$lib/Profile.svelte";
	import Alert from "$lib/Alert.svelte";
	import { _ } from "svelte-i18n";

	/** @type {import("./$types").ActionData} */
	export let form;
</script>

<div style="display: flex; flex-direction: column; justify-content: space-between; height: 100vh; margin: 0; padding: 0;">
	<SwayWindow title="{$_('general.login_noun')}" mainStyle="max-width: 300px; min-width: 300px; flex: 1">
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
							<input type="submit" value="{$_('general.login_verb')}">
						</td>
					</tr>
				</tbody>
			</table>
		</form>
		{#if form?.res.error}
			<Alert severity="{form.res.error.severity}" code="{form.res.error.code}"/>
		{/if}
	</SwayWindow>

	<SwayWindow title="{$_('general.register_noun')}" mainStyle="max-width: 300px; min-width: 300px; flex: 1">
		<form style="display: flex" method="POST" use:enhance>
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
							<input type="submit" value="{$_('general.register_verb')}" on:click|preventDefault={() => { alert($_("warning.WIP")) }}>
						</td>
					</tr>
				</tbody>
			</table>
		</form>
	</SwayWindow>
	<SwayWindow title="{$_('general.links')}" mainStyle="max-width: 300px; min-width: 300px; flex-grow: 0" contentStyle="display: flex; flex-direction: column">
		<a class="links" href="/about">{$_("general.about")}</a>
		<a class="links" href="/add">add track (temp. placement)</a>
		<a class="links" href="https://github.com/Toraalv/UtaSuki">github</a>
	</SwayWindow>
</div>

<SwayWindow title="{$_('general.user_profiles')}" altTitle="{$_('general.user_profiles+')}">
	{#if $page.data.users.error}
		<Alert severity="{$page.data.users.error.severity}" code="{$page.data.users.error.code}"/>
	{:else}
		{#each $page.data.users as user}
			<a href="/{user.username}">
				<Profile username="{user.username}" image="{user.image}" created="{new Date(user.created)}" activity="{user.last_activity}"/>
			</a>
		{/each}
	{/if}
</SwayWindow>

<style>
	.links {
		width: 100%;
		text-decoration-line: underline;
		color: var(--link);
	}
	.links + .links {
		margin-top: 10px;
	}
</style>
