<script>
	import { _ } from "svelte-i18n";
	import { CDN_ADDR } from "$lib/globals.js";

	let {
		username = "artist of track",
		image = "/test_profile.jpg",
		created = new Date(),
		activity = $bindable(null),
		authed = false
	} = $props();
	
	let memberSince = `${created.getFullYear()}-${(created.getMonth() + 1) < 10 ? "0" + (created.getMonth() + 1) : (created.getMonth() + 1)}-${created.getDate() < 10 ? "0" + created.getDate() : (created.getDate())}`;

	if (activity != null) {
		activity = new Date(activity); // まぁまぁまぁ
		activity = `${activity.getFullYear()}-${(activity.getMonth() + 1) < 10 ? "0" + (activity.getMonth() + 1) : (activity.getMonth() + 1)}-${activity.getDate() < 10 ? "0" + activity.getDate() : (activity.getDate())}`;
	}
</script>

<div class="profile" style={authed && "background-color: #1b1b1b"}> <!-- need better colour management -->
	<img src={CDN_ADDR + image} alt="profile">
	<div class="profileInfo">
		<h1>{username}</h1>
		<!-- {#if bio}
			<p>{bio}</p>
		{/if} -->
		<div style="display: flex; flex-direction: row">
			{#if created}
				<h5>{$_("general.member_since")}: {memberSince}</h5>
			{/if}
			{#if created && activity}
				<div style="margin: 0 8px 0 8px; width: 2px; background-color: var(--unfocused_border)"></div>
			{/if}
			{#if activity}
				<h5>{$_("general.last_activity")}: {activity}</h5>
			{/if}
		</div>
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
		margin-bottom: 10px;
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
