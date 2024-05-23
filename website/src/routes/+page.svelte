<script>
	import { page } from "$app/stores";
	import SwayWindow from "$lib/SwayWindow.svelte";
	import Profile from "$lib/Profile.svelte";
	import Alert from "$lib/Alert.svelte";

	console.log($page.data.users);
</script>

<SwayWindow title="login" altTitle="login" mainStyle="max-width: 300px; min-width: 300px">
</SwayWindow>

<SwayWindow title="user profiles" altTitle="publicly visible user profiles on utasuki">
	{#if $page.data.users.error}
		<Alert severity="{$page.data.users.error.severity}" code="{$page.data.users.error.code}" />
	{:else}
		{#each $page.data.users as user}
			<a href="/{user.username}">
				<Profile username="{user.username}" image="{user.image}" created="{user.created}"/>
			</a>
		{/each}
	{/if}
</SwayWindow>

<style>
	a {
		margin: 10px;
	}
</style>
