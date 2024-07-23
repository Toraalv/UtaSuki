<script>
	import { page } from "$app/stores";
	import SwayWindow from "$lib/SwayWindow.svelte";
	import Profile from "$lib/Profile.svelte";
	import Alert from "$lib/Alert.svelte";
	import { _ } from "svelte-i18n";
</script>

<SwayWindow title="{$_('general.login')}" altTitle="{$_('general.login')}" mainStyle="max-width: 300px; min-width: 300px">
</SwayWindow>

<SwayWindow title="{$_('general.user_profiles')}" altTitle="{$_('general.user_profiles_alt')}">
	{#if $page.data.users.error}
		<Alert severity="{$page.data.users.error.severity}" code="{$page.data.users.error.code}" />
	{:else}
		{#each $page.data.users as user}
			<a href="/{user.username}">
				<Profile username="{user.username}" image="{user.image}" created="{new Date(user.created)}"/>
			</a>
		{/each}
	{/if}
</SwayWindow>

<style>
	a {
		margin: 10px;
	}
</style>
