<script>
	import { CDN_ADDR } from "$lib/globals.js";
	import NavButton from "$lib/NavButton.svelte";

	import { page } from "$app/stores";
	import { _ } from "svelte-i18n";

	let {
		mainStyle = null,
		contentStyle = null,
		content = $bindable()
	} = $props();
</script>

<div class="swayWindow" style={mainStyle}>
	<!--
	<div class="swayWindowTitle">
		<h5>asd</h5>
	</div>
	-->
	<div bind:this={content} class="swayWindowContent" style={contentStyle}>
		<div style="display: flex;">
			<img id="logo" src="/favicon.png"/>
			<h3 id="logoText">UtaSuki</h3>
		</div>
		<div id="places">
			<NavButton active={$page.url.pathname == "/"} href="/">{$_("general.home")}</NavButton>
			<NavButton active={$page.url.pathname == "/community"} href="/community">{$_("general.community")}</NavButton>
			<NavButton active={$page.url.pathname == "/user/" + $page.data.auth_info.profile.uid || $page.url.pathname.split('/')[1] == $page.data.auth_info.profile.uid} href={"/user/" + $page.data.auth_info.profile.uid}>{$_("general.user_tracks")}</NavButton>
			<NavButton active={$page.url.pathname == "/add"} href="/add">{$_("general.add_track")}</NavButton>
			<NavButton active={$page.url.pathname == "/settings"} href="/settings">{$_("general.settings")}</NavButton>
		</div>
		<a href="/settings" id="profile">
			<h3 id="username">{$page.data.auth_info.profile.username}</h3>
			<img id="pfp" alt="profile" src={CDN_ADDR + $page.data.auth_info.profile.image + `?${$page.data.auth_info.profile.image_ver}`}/>
		</a>
	</div>
</div>

<style>
	#places {
		display: flex;
		padding: 4px;
	}
	.swayWindow {
		position: relative;
		background-color: var(--bg);
		margin: 10px 10px 0px 10px;
		display: flex;
		flex-grow: 0;
		flex-direction: column;
		overflow: auto;

		/* new and improved™ */
		/*border-radius: var(--border_radius);*/
		/*border: 2px solid var(--unfocused_background);*/
	}

	.swayWindow:hover .swayWindowTitle, .swayWindow:hover .swayWindowContent {
		border-color: var(--accent);
	}
	.swayWindow:hover .swayWindowTitle {
		background-color: var(--accent);
		color: var(--text);
	}
	
	.swayWindowTitle {
		font-weight: normal;
		padding: 0 4px;
		background-color: var(--unfocused_background);
		color: var(--unfocused_text);
		height: 10px;
		line-height: 20px;

		/* new and improved™ */
		border-radius: var(--border_radius) var(--border_radius) 0 0;
		border-top: 2px solid var(--unfocused_background);
		border-right: 2px solid var(--unfocused_background);
		border-left: 2px solid var(--unfocused_background);

		transition: 0.2s;

		/* funkar bra med border-radius */
		text-align: center;
	}
	.swayWindowContent {
		overflow-x: hidden;
		overflow-y: hidden;
		height: 40px;
		padding: 4px;
		display: flex;
		justify-content: space-between;
		flex-grow: 1;

		/* new and improved™ */
		border-radius: var(--border_radius) var(--border_radius);
		border-top: 2px solid var(--unfocused_background);
		border-right: 2px solid var(--unfocused_background);
		border-bottom: 2px solid var(--unfocused_background);
		border-left: 2px solid var(--unfocused_background);
		background-color: #070707; /* ここだ！ */

		transition: 0.2s;
	}
	img {
		height: 100%;
		width: 40px;
		object-fit: cover;

	}
	#pfp, #logo {
		border-radius: var(--border_radius_small);
	}
	#username, #logoText {
		align-content: center;
		margin: 0 10px;
		line-height: 42px;
	}
	#profile {
		display: flex;
		flex-direction: row;
		outline: none;
		border-radius: var(--border_radius_small) var(--border_radius_small);
		transition: 0.2s;
	}
	#profile:hover {
		background-color: var(--unfocused_background);
	}
	#profile:focus {
		background-color: var(--unfocused_border);
		box-shadow: 0 0 0 0px var(--unfocused_border);
	}

	@media only screen and (max-width: 1068px) {
		#username, #logoText {
			display: none;
		}
	}
</style>
