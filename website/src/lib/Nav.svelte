<script>
	import { PFP_PATH } from "$lib/globals.js";
	import { LEN_LIMITS } from "$lib/globals.js";
	import NavButton from "$lib/NavButton.svelte";
	import SwayWindow from "$lib/SwayWindow.svelte";
	import Alert from "$lib/Alert.svelte";
	import AnimatedDots from "$lib/AnimatedDots.svelte";
	import { setLang } from "$lib/helpers.js";

	import { page } from "$app/stores";
	import { _ } from "svelte-i18n";
	import { enhance } from "$app/forms";

	function focus(node) {
		node.focus();
	}

	let overlay = $state();

	// login form feedback
	let lastError = $state("");
	let showLogin = $state(false);
	let showLoginError = $state(false);
	const hideLogin = () => {
		showLogin = false;
		showLoginError = false;
	}

	let loginEmailInputVal = $state("");
	let loginPasswordInputVal = $state("");

	let loginFlight = $state(false);
</script>

<div class="swayWindow">
	<div class="swayWindowTitle">
		<!--<h5>nav</h5>-->
	</div>
	<div class="swayWindowContent">
		<div style:align-items="center">
			<img id="logo" alt="logo" src="/favicon.png"/>
			<h3 id="logoText">UtaSuki</h3>
		</div>
		<div style:justify-content="center">
			<NavButton tabindex=1 active={$page.url.pathname == "/"} href="/">{$_("general.home")}</NavButton>
			<NavButton tabindex=2 active={$page.url.pathname == "/users"} href="/users">{$_("general.users")}</NavButton>
			{#if $page.data.auth_info?.authed}
				<NavButton tabindex=3 active={$page.url.pathname.match("/user/" + $page.data.auth_info.profile.uid)} href={"/user/" + $page.data.auth_info.profile.uid}>{$_("general.user_tracks")}</NavButton>
				<NavButton tabindex=4 active={$page.url.pathname == "/add"} href="/add">{$_("general.add_track")}</NavButton>
			{/if}
		</div>
		{#if $page.data.auth_info?.authed}
			<div>
				<div id="profileDropdown">
					<div id="profile">
						<h3 title={$page.data.auth_info.profile.username} id="username">{$page.data.auth_info.profile.username}</h3>
						<img id="pfp" alt="profile" src={`${PFP_PATH}/${$page.data.auth_info.profile.image}?${$page.data.auth_info.profile.image_ver}`}/>
					</div>
					<div id="profileDropdownContent">
						<ul>
							<li>
								<a style="display: block; width: 100%;" href="/settings/account">{$_("general.settings")}</a>
							</li>
							<li>
								<form
									action="/?/logout"
									method="POST"
									use:enhance={() => {
										return async ({ update }) => {
											await update({ reset: true });
											setLang("en");
											document.documentElement.style.setProperty("--border_radius", "var(--default_border_radius)");
											document.documentElement.style.setProperty("--body_margin", "var(--default_body_margin)");
											document.documentElement.style.setProperty("--transition", "var(--default_transition)");
											if ($page.route.id.match("/user/\\[slug]")?.length) {
												document.documentElement.style.setProperty("--accent", $page.data.data.profile.accent);
												document.documentElement.style.setProperty("--accent_text", $page.data.data.profile.accent_text);
											} else {
												document.documentElement.style.setProperty("--accent", "var(--default_accent)");
												document.documentElement.style.setProperty("--accent_text", "var(--default_accent_text)");
												document.documentElement.style.setProperty("--opacity", "var(--default_opacity)");
												document.documentElement.style.setProperty("--blur", "var(--default_blur)");
											}
										};
									}}
								>
									<input
										type="submit"
										value="{$_("general.logout")}"
										style="border: none; text-align: inherit; background-color: inherit;"
									>
								</form>
							</li>
						</ul>
					</div>
				</div>
			</div>
		{:else}
			<div>
				<NavButton tabindex=7 onclick={ () => showLogin = !showLogin } active={showLogin}>{$_("general.login_verb")}</NavButton>
				<NavButton tabindex=8 active={$page.url.pathname == "/register"} href="/register">{$_("general.register_noun")}</NavButton>
			</div>
		{/if}
	</div>
</div>

{#if showLogin}
	<div bind:this={overlay} onclick={(_this) => _this.target === overlay && hideLogin()} onkeydown={(e) => e.key == "Escape" && hideLogin()} class="overlay" role="button" tabindex=-1>
		<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -100%); z-index: 2; cursor: auto;">
			<SwayWindow
				title={$_("general.login_verb")}
				mainStyle="margin: 0; display: {loginFlight && "none"}"
				titleStyle="background-color: var(--accent); color: var(--text); border-color: var(--accent)"
				contentStyle="border-color: var(--accent)"
			>
				<form
					style="display: flex;"
					method="POST"
					action="/?/login"
					onsubmit={() => showLoginError = false}
					use:enhance={() => {
						loginFlight = true;

						return async ({ update, result }) => {
							await update({ reset: false });
							loginFlight = false;
							if (result.status == 200) {
								showLogin = false;
								setLang(result.data.data.settings.language);
								document.documentElement.style.setProperty("--border_radius", result.data.data.settings.border_radius == "1" ? "var(--default_border_radius)" : 0);
								document.documentElement.style.setProperty("--body_margin", result.data.data.settings.body_margin == "1" ? "var(--default_body_margin)" : 0);
								document.documentElement.style.setProperty("--transition", result.data.data.settings.animations == "1" ? "var(--default_transition)" : 0);
								if ($page.route.id.match("/user/\\[slug]")?.length) {
									document.documentElement.style.setProperty("--accent", $page.data.data.profile.accent);
									document.documentElement.style.setProperty("--accent_text", $page.data.data.profile.accent_text);
									document.documentElement.style.setProperty("--opacity", $page.data.data.profile.opacity / 100);
									document.documentElement.style.setProperty("--blur", $page.data.data.profile.blur);
								} else {
									document.documentElement.style.setProperty("--accent", result.data.data.settings.accent == "" ? "var(--default_accent)" : result.data.data.settings.accent);
									document.documentElement.style.setProperty("--accent_text", result.data.data.settings.accent_text == "" ? "var(--default_accent_text)" : result.data.data.settings.accent_text);
									document.documentElement.style.setProperty("--opacity", result.data.data.settings.opacity / 100);
									document.documentElement.style.setProperty("--blur", result.data.data.settings.blur);
								}
							} else {
								lastError = result.data.code;
								showLoginError = true;
							}
						};
					}}
				>
					<table style="flex-grow: 1;">
						<tbody>
							<tr>
								<td>{$_("general.email")}:</td>
							</tr>
							<tr>
								<td>
									<input
										type="email"
										name="email"
										bind:value={loginEmailInputVal}
										disabled={loginFlight}
										maxlength={LEN_LIMITS.EMAIL}
										autocomplete="off"
										use:focus
										required
									/>
								</td>
							</tr>
							<tr>
								<td>{$_("settings.password")}:</td>
							</tr>
							<tr>
								<td>
									<input
										type="password"
										name="password"
										bind:value={loginPasswordInputVal}
										disabled={loginFlight}
										maxlength={LEN_LIMITS.PASSWORD}
										autocomplete="off"
										required
									/>
								</td>
							</tr>
							<tr>
								<td></td>
							</tr>
							<tr>
								<td>
									<input
										type="submit"
										disabled={loginFlight || !loginEmailInputVal.length || !loginPasswordInputVal.length}
										value={$_("general.login_verb")}
									/>
								</td>
							</tr>
						</tbody>
					</table>
				</form>
			</SwayWindow>
		</div>
		{#if loginFlight}
			<div style="position: absolute; top: 45%; left: 50%; transform: translate(-50%, -100%); z-index: 2;">
				<Alert code="info.logging_in" mainStyle="min-width: 15vw;">
					<p>{$_("info.logging_in")}</p><AnimatedDots/>
				</Alert>
			</div>
		{/if}
		{#if showLoginError}
			<div style="position: absolute; top: 65%; left: 50%; transform: translate(-50%, -100%); z-index: 2;">
				<Alert code={lastError}/>
			</div>
		{/if}
	</div>
{/if}

<style>
	li:hover {
		background-color: var(--unfocused_background) !important;
	}
	li:focus-within {
		background-color: var(--unfocused_border) !important;
	}
	li:nth-child(odd) {
		background-color: var(--input_bg);
	}
	li:nth-child(even) {
		background-color: #000;
	}
	a:focus, input[type="submit"] { outline-color: #00000000; }
	.swayWindow {
		position: relative;
		margin: 10px 10px 0px 10px;
		display: flex;
		flex-grow: 0;
		flex-direction: column;
		overflow: visible;
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
		border-radius: var(--border_radius) var(--border_radius) 0 0;
		border-top: 2px solid var(--unfocused_background);
		border-right: 2px solid var(--unfocused_background);
		border-left: 2px solid var(--unfocused_background);
		transition: var(--transition);
		text-align: center;
	}
	.swayWindowContent {
		overflow-x: visible;
		overflow-y: visible;
		background-color: var(--bg);
		padding: 2px;
		display: flex;
		flex-grow: 1;
		border-radius: 0 0 var(--border_radius) var(--border_radius);
		border-right: 2px solid var(--unfocused_background);
		border-bottom: 2px solid var(--unfocused_background);
		border-left: 2px solid var(--unfocused_background);
		transition: var(--transition);
		backdrop-filter: blur(var(--blur));
		z-index: 1;
	}
	.swayWindowContent > * {
		display: flex;
		flex: 1 0 0;
		padding: 4px;
	}
	.swayWindowContent > *:last-child {
		justify-content: flex-end;
	}
	img {
		height: 30px;
		width: 30px;
		object-fit: cover;

	}
	#pfp, #logo {
		border-radius: var(--border_radius_small);
	}
	#username, #logoText {
		align-content: center;
		margin: 0 10px;
		text-overflow: ellipsis;
		overflow-x: hidden;

	}
	#profile {
		display: flex;
		flex-direction: row;
		justify-content: end;
		min-width: 150px;
		max-width: 300px;
		align-items: center;
	}
	#profileDropdown {
		border-radius: var(--border_radius_small) var(--border_radius_small);
		box-shadow: 0 -1px #00000000, 1px 0 #00000000, -1px 0 #00000000;
		transition: var(--transition);
		display: inline-block;
		position: relative;
		outline: none;
	}
	#profileDropdown:hover {
		background-color: #000;
		box-shadow: 0 -1px var(--accent), 1px 0 var(--accent), -1px 0 var(--accent);
		border-end-end-radius: 0;
		border-end-start-radius: 0;
	}
	#profileDropdown:focus, #profileDropdown:focus-within {
		box-shadow: 0 -1px var(--accent), 1px 0 var(--accent), -1px 0 var(--accent);
		border-end-end-radius: 0;
		border-end-start-radius: 0;
	}
	#profileDropdownContent {
		background-color: var(--bg);
		border-radius: 0 0 var(--border_radius_small) var(--border_radius_small);
		box-shadow: 0 1px var(--accent), 1px 0 var(--accent), -1px 0 var(--accent);
		transition: z-index 1ms, opacity var(--transition);
		opacity: 0;
		min-width: 100%;
		z-index: -1;
		overflow: auto;
		position: absolute;
		right: 0px;
		text-align: right;
	}
	#profileDropdown:focus-within #profileDropdownContent {
	}
	#profileDropdown:hover #profileDropdownContent, #profileDropdown:focus #profileDropdownContent, #profileDropdownContent:focus-within {
		opacity: 100;
		z-index: 3;
	}

	@media only screen and (max-width: 892px) {
		#username, #logoText {
			display: none;
		}
		#profile { min-width: unset; }
	}
</style>
