<script>
	import SwayWindow from "$lib/SwayWindow.svelte";
	import Nav from "$lib/Nav.svelte";
	import { CDN_ADDR } from "$lib/globals.js";

	import { page } from "$app/stores";
	import { _ } from "svelte-i18n";
	import { version } from "$app/environment";

	let { data } = $props();
</script>

<div style="display: flex; flex-grow: 1;">
	<SwayWindow title={$_("general.welcome")} contentStyle="display: flex; flex-direction: column; justify-content: space-between;">
		<span>
			<h1 style:text-decoration="underline">{$_("about.welcome")}</h1>
			<h3>{$_("about.p1")}</h3>
			<h3>{$_("about.p2")}</h3>
			<h3>{$_("about.p3")}</h3>
			<h3>{$_("about.p4")}</h3>
			<h3>{@html $_("about.p5")}</h3>
			<div style:border-top="1px solid var(--unfocused_border)"></div>
			<h3>{$_("about.contact")}:</h3>
			<p>{$_("general.name")}: Toralv</p>
			<p>{$_("general.email")}: <a href="mailto:utasuki.toralv.dev">utasuki@toralv.dev</a></p>
			<p>{$_("general.homepage")}: <a href="https://toralv.dev">toralv.dev</a></p>
		</span>
		<footer style="text-align: center;">
			<span style="color: var(--d2_text);">version: {version}</span>
		</footer>
	</SwayWindow>
	<div style="display:flex; flex-direction: column; min-width: 300px; max-width: 300px;">
		<SwayWindow title={$_("general.activity")} mainStyle="flex: 3 0 0;">
			<div style="text-align: center; align-content: center; height: 100%;">{$_("general.WIP")}</div>
		</SwayWindow>
		<SwayWindow title={$_("general.changelog")} altTitle={$_("general.english_only")} mainStyle="flex: 2 0 0;" contentStyle="padding: 0">
			<table>
				<tbody>
					{#each data.changelog as line}
						{#if line.substring(0, 9) === "version: "}
							<tr>
								<td></td>
								<td style="font-weight: revert; font-size: revert;">{line.substring(9)}</td>
							</tr>
						{:else if line === ''}
							<tr>
								<td style:color="#00000000">-</td>
								<td></td>
							</tr>
						{:else}
							<tr>
								<td>-</td>
								<td>{line}</td>
							</tr>
						{/if}
					{/each}
				</tbody>
			</table>
		</SwayWindow>
	</div>
</div>

<style>
	table {
		border-spacing: 0;
	}
	td {
		font-weight: normal;
		vertical-align: baseline;
		font-size: 14px;
		padding: 2px 0 2px 5px;
	}
	tr:nth-child(even) {
		background-color: var(--input_bg);
	}
	a {
		text-decoration: revert;
		color: var(--link);
	}
	p {
		margin: 4px 0;
	}
	img {
		width: 64px;
		height: 64px;
		object-fit: cover;
	}
	h3, h1 {
		margin: 24px 0;
	}
</style>
