<script>
	import { page } from "$app/stores";
	import SwayWindow from "$lib/SwayWindow.svelte";
	import { _ } from "svelte-i18n";
	import { CDN_ADDR } from "$lib/globals.js";
</script>

<SwayWindow title="{$_('general.about_site')}" contentStyle="display: flex; flex-direction: column; flex-grow: 1; align-items: center; justify-content: space-between">
	<div style="display: flex; flex-direction: column; align-items: center">
		<div style="display: flex;">
			<a href="https://github.com/Toraalv">
				<img src="{CDN_ADDR + '/static/images/profile_pictures/toralv.png'}" alt="author">
			</a>
			<div id="bioInfo" style="margin-left: 20px">
				<p>{$_("general.name")}: Toralv</p>
				<p>{$_("general.email")}: <a href="mailto:utasuki.toralv.dev">utasuki@toralv.dev</a></p>
				<p>{$_("general.homepage")}: <a href="https://toralv.dev">toralv.dev</a></p>
			</div>
		</div>
		<p>{$_("about.p1")}</p>
		<p>{$_("about.p2")}</p>
		<p>{$_("about.p3")}</p>
		<p>{$_("about.p4")}</p>
		<p>{@html $_("about.p5")}</p>
	</div>
		<p style="color: var(--unfocused_indicator)">(〜￣△￣)〜</p>
	<div>
		<p style="color: var(--unfocused_indicator)">{@html $_("about.pfp")}</p>
	</div>
</SwayWindow>

<style>
	#bioInfo > * {
		text-align: unset;
	}
	a {
		text-decoration-line: underline;
		color: var(--link);
	}
	img {
		height: 112px; /* (╮°-°)╮┳━━┳ ( ╯°□°)╯ ┻━━┻ */
		width: auto;
	}
	p {
		margin-bottom: 0;
		max-width: 30vw;
		text-align: center;
	}
</style>
