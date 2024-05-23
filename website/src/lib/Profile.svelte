<script>
	// const är bara för att svelte inte ska klaga, använder inte de fälten precis just nu
	export let username = "artist of track";
	export let image = "/test_profile.jpg";
	export let bio = "this is some users bio, very cool";
	export let created = null;
</script>

<div class="profile">
	<img src="{image}" alt="profile picture">
	<div class="profileInfo">
		<h1>{username}</h1>
		{#if bio}
			<p>{bio}</p>
		{/if}
		{#if created}
			<h5>member since: {created}</h5>
		{/if}
	</div>
</div>

<style>
	p {
		padding: 0;
		margin: 0;
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
