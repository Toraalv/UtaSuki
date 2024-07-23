<script>
	import { _ } from "svelte-i18n";
	import { CDN_ADDR } from "$lib/globals.js";
	export let username = "artist of track";
	export let image = "/test_profile.jpg";
	//export let bio = "this is some users bio, very cool";
	export let created = new Date();

	
	let memberSince = `${created.getFullYear()}-${(created.getMonth() + 1) < 10 ? "0" + (created.getMonth() + 1) : (created.getMonth() + 1)}-${created.getDate() < 10 ? "0" + created.getDate() : (created.getDate())}`
</script>

<div class="profile">
	<img src="{image.substring(0, 5) == "https" ? image : (CDN_ADDR + image)}" alt="profile">
	<div class="profileInfo">
		<h1>{username}</h1>
		<!-- {#if bio}
			<p>{bio}</p>
		{/if} -->
		{#if created}
			<h5>{$_("general.member_since")}: {memberSince}</h5>
		{/if}
	</div>
</div>

<style>
	h5 {
		color: var(--d_text);
	}
	img {
		object-fit: cover;
		height: 100px;
		width: 100%;
		max-width: 100px;
		max-height: 100px;
	}

	.profile {
		display: flex;
		flex-direction: row;
		background-color: #111111;
		border: 1px solid var(--unfocused_border);
	}
	.profileInfo {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		/* font-family: "DejaVuSans"; */
		margin: 10px;
	}
	.profileInfo h1 {
		margin: 0;
		font-weight: bold;
		overflow: hidden;
		display: -webkit-box;
		-webkit-line-clamp: 1;
				line-clamp: 1; 
		-webkit-box-orient: vertical;
	}
	.profileInfo h1:hover {
		overflow-y: auto;
		display: inherit;
	}
</style>
