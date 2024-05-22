<script>
	import { page } from "$app/stores";
	import SwayWindow from "$lib/SwayWindow.svelte";
	import Alert from "$lib/Alert.svelte";
</script>

<SwayWindow title="login" altTitle="login" mainStyle="max-width: 300px; min-width: 300px">
</SwayWindow>

<SwayWindow title="user profiles" altTitle="publicly visible user profiles on utasuki" contentStyle="display: flex; flex-wrap: wrap">
	{#if $page.data.users.error}
		<Alert severity="{$page.data.users.error.severity}" code="{$page.data.users.error.code}" />
	{:else}
		{#each $page.data.users as user}
			<a href="/{user.username}">
				<img src="/test_pfp.png" alt="profile picture">
				<h4>{user.username}</h4>
			</a>
		{/each}
	{/if}
</SwayWindow>

<style>
	a {
		display: flex;
		flex-direction: column;
		margin: 10px;
		width: 100%;
		max-width: 150px;
	}
	img {
		object-fit: cover;
		height: 150px;
		width: 100%;
		max-width: 150px;
		max-height: 150px;
	}
	h4 {
		background-color: #111111;
		text-align: center;
		padding: 6px;
		margin-bottom: 10px;
		font-size: 14pt;
		height: 22.5px;
		overflow-x: hidden;
		overflow-y: auto;
	}
	h4:hover {
		background-color: var(--unfocused_background);
	}
</style>
