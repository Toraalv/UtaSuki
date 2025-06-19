<script>
	import SwayWindow from "$lib/SwayWindow.svelte";
	import Profile from "$lib/Profile.svelte";
	import Alert from "$lib/Alert.svelte";

	import { page } from "$app/stores";
	import { _ } from "svelte-i18n";
</script>

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

