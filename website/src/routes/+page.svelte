<script>
	import SwayWindow from "$lib/SwayWindow.svelte";
	import Nav from "$lib/Nav.svelte";
	import { CDN_ADDR } from "$lib/globals.js";

	import { page } from "$app/stores";
	import { _ } from "svelte-i18n";
</script>

<div style="display: flex; flex-grow: 1;">
	<SwayWindow title="welcome message">
		<h1 style:margin-top="24px">{$_("root.p1")}</h1>
		<h2 style:margin-top="24px">{$_("root.p2")}</h2>
	</SwayWindow>
	<div style="display:flex; flex-direction: column; min-width: 300px; max-width: 300px;">
		<SwayWindow title="activity" mainStyle="flex: 3 0 0;">
			<div style="display: flex;">
				<img src={CDN_ADDR + "/static/images/profile_pictures/1.png"}>
				<div style="margin-left: 10px; align-content: center;">
					<h2>Toralv</h2>
					<span>did this</span>
				</div>
			</div>

			<div style="display: flex;">
				<img src={CDN_ADDR + "/static/images/profile_pictures/2"}>
				<div style="margin-left: 10px; align-content: center;">
					<h2>user1</h2>
					<span>did that</span>
				</div>
			</div>

			<div style="display: flex;">
				<img src={CDN_ADDR + "/static/images/profile_pictures/3"}>
				<div style="margin-left: 10px; align-content: center;">
					<h2>user3</h2>
					<span>added this</span>
				</div>
			</div>

			<div style="display: flex;">
				<img src={CDN_ADDR + "/static/images/profile_pictures/4"}>
				<div style="margin-left: 10px; align-content: center;">
					<h2>xX_user9_Xx</h2>
					<span>did this</span>
				</div>
			</div>

			<div style="display: flex;">
				<img src={CDN_ADDR + "/static/images/profile_pictures/5"}>
				<div style="margin-left: 10px; align-content: center;">
					<h2>user12</h2>
					<span>did that</span>
				</div>
			</div>

			<div style="display: flex;">
				<img src={CDN_ADDR + "/static/images/profile_pictures/6"}>
				<div style="margin-left: 10px; align-content: center;">
					<h2>user45</h2>
					<span>added this</span>
				</div>
			</div>
		</SwayWindow>
		<SwayWindow title="changelog" mainStyle="flex: 2 0 0;">
			<table>
				<tbody>
					<tr>
						<td>-</td>
						<td>fixed funny guys not being funny</td>
					</tr>
					<tr>
						<td>-</td>
						<td>we made sure to make the worst possible decisions for your sake</td>
					</tr>
					<tr>
						<td>-</td>
						<td>made miku our lord and saviour</td>
					</tr>
				</tbody>
			</table>
		</SwayWindow>
	</div>
</div>

<style>
	div + div {
		margin-top: 10px;
	}
	img {
		width: 64px;
		height: 64px;
		object-fit: cover;
	}
</style>
