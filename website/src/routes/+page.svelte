<script>
	import SwayWindow from "$lib/SwayWindow.svelte";
	import Alert from "$lib/Alert.svelte";
	import Nav from "$lib/Nav.svelte";
	import { CDN_ADDR } from "$lib/globals.js";

	import { page } from "$app/stores";
	import { _ } from "svelte-i18n";
	import { version } from "$app/environment";

	let { data } = $props();
</script>

<div style="display: flex; flex-grow: 1; height: 0%;"> <!-- height: 0% makes perfect sense -->
	<!---- WELCOME MESSAGE ---->
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

	<div style="display:flex; flex-direction: column; min-width: 250px; max-width: 350px;">
		<!---- ACTIVITY PANEL ---->
		<SwayWindow title={$_("general.activity")} mainStyle="flex: 3 0 0;" contentStyle="padding: 0;">
			{#if $page.data.code.split('.')[0] == "error"}
				<Alert mainStyle="margin: 10px; position: absolute; top: 50%; transform: translateY(-50%);" code={$page.data.code}/>
			{:else}
				<ul style="display:flex; flex-direction: column-reverse;">
					{#each data.activities.data as activity}
						<li class="activityContainer">
							<img alt="cover" src={`${CDN_ADDR}/static/images/album_covers/${activity.cover}`}>
							<!--<img alt="profile" src={CDN_ADDR + activity.pfp}>-->
							<div class="activityContent">
								<h4 title={activity.username}>
									<a href="/user/{activity.uid}" style="text-decoration: none; font-weight: bold;">{activity.username}</a> {$_(`general.${activity.action}`)}:
								</h4>
								<h4 title={activity.title}>
									<span style="color: white;">{activity.title}</span>
								</h4>
								<h4 title={activity.artist}>
									{$_("general.by")} {activity.artist}
								</h4>
							</div>
						</li>
					{/each}
				</ul>
			{/if}
		</SwayWindow>
		<!---- CHANGELOG PANEL ---->
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
	.activityContainer {
		display: flex;
		padding: 6px;
		font-size: 14px;
	}
	.activityContent > * {
		font-weight: inherit;
		height: 1rem;
		line-height: 1rem;
		font-weight: normal;
		word-break: break-all;
		overflow: hidden;
		display: -webkit-box;
		-webkit-line-clamp: 1;
		-webkit-box-orient: vertical;
	}
	.activityContainer > img {
		object-fit: contain;
		border-radius: var(--border_radius_small);
		width: 3rem;
		height: 3rem;
	}
	.activityContainer > img:first-child { margin-right: 8px; }
	.activityContainer > img:last-child { margin: 0 auto 0 8px; }
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
	h3, h1 {
		margin: 24px 0;
	}
</style>
