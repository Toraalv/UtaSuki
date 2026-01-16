<script>
	import SwayWindow from "$lib/SwayWindow.svelte";
	import { PFP_PATH } from "$lib/globals.js";

	import { page } from "$app/stores";
	import { _ } from "svelte-i18n";
</script>

<SwayWindow title={$_("general.about_site")} contentStyle="display: flex; flex-direction: column; flex-grow: 1; align-items: center; justify-content: space-between">
	<div style="display: flex; flex-direction: column; align-items: center; margin: 0 10px;">
		<div style="display: flex;">
			<a href="https://github.com/Toraalv">
				<img src={`${PFP_PATH}/1.png`} alt="author">
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
	<p id="kaomoji" style="color: var(--unfocused_indicator)"></p>
	<div></div>
	<!-- <p style="color: var(--unfocused_indicator)">{@html $_("about.pfp")}</p> -->
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
		max-width: 40em;
		text-align: center;
	}
	#kaomoji:before { content: "(〜￣△￣)〜" }
	#kaomoji:hover:before { content: "(╮°-°)╮┳━━┳ ( ╯°□°)╯ ┻━━┻" }
</style>
