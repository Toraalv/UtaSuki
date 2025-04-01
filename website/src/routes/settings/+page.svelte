<script>
	import SwayWindow from "$lib/SwayWindow.svelte";
	import ControlPanel from "$lib/ControlPanel.svelte";
	import Footer from "$lib/Footer.svelte";
	import Alert from "$lib/Alert.svelte";

	import { goto } from "$app/navigation";
	import { page } from "$app/stores";
	import { enhance } from "$app/forms";
	import { _ } from "svelte-i18n";

	let { form } = $props();

	let imageInput = $state();
	let image = $state();
	let showImage = $state(false);
	function imageChange() {
		const file = imageInput.files[0];

		if (file) {
			const reader = new FileReader();
			reader.addEventListener("load", function () {
				image.setAttribute("src", reader.result);
			});
			reader.readAsDataURL(file);
			return;
		}
	}

	let redirectTimeoutID = $state();
	let redirectTimeout = () => redirectTimeoutID = setTimeout(() => goto("/settings"), 2000);

	console.log($page.data);
</script>

{#snippet textCounter(inputVal, err, MAX_LEN)}
	<p style="position: absolute; top: 0; right: 0; margin: 0 10px; height: 100%; align-content: center; {`color: var(--${err ? "warning" : "d2_text"});`}">{MAX_LEN - encodeURIComponent(inputVal).length}</p>
{/snippet}

{#snippet inputWarning(err, code)}
	{#if err}
		<tr>
			<td>
			<td style="color: var(--warning)">{$_(code)}</td>
		</tr>
	{/if}
{/snippet}

<div style="display: flex; flex-direction: column; justify-content: space-between; height: 100vh; margin: 0; padding: 0;">
	<ControlPanel/>
	<Footer/>
</div>

<SwayWindow contentStyle="padding: 20px;" title={$_("general.settings")}>
	<form method="POST" enctype="multipart/form-data" action="?/addTrack" use:enhance>
		<table>
			<tbody>
				<tr>
					<td>{$_("general.profile_picture")}:</td>
					<td>
						<label for="imageSelect">
							<img style={`display: ${showImage ? "block" : "none"}`} src="" alt="input profile" bind:this={image}>
							<input type="file" name="file" accept="image/*" id="imageSelect" bind:this={imageInput} onchange={imageChange} autocomplete="off" required>
						</label>
					</td>
				</tr>
				<tr>
					<td>{$_("general.username")}:</td>
					<td>
						<input type="text" name="title" value={$page.data.auth_info.profile.username} autocomplete="off" maxlength="255">
					</td>
				</tr>
				<tr>
					<td>{$_("general.public")}:</td>
					<td>
						<input type="checkbox" name="public">
					</td>
				</tr>
			</tbody>
		</table>
		<table>
			<tbody>
				<tr>
					<td>
						<input style="padding: 2px 1px; margin-top: 10px;" type="submit" value={$_("general.save")} onclick={() => { showImage = false; redirectTimeout(); }}>
					</td>
				</tr>
			</tbody>
		</table>
	</form>
</SwayWindow>

{#if form?.res}
	<a onclick={() => clearTimeout(redirectTimeoutID)} href="/settings">
		<div class="overlay"></div>
		<Alert code={form.code} mainStyle="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -100%); z-index: 2"/>
	</a>
{/if}

<style>
	label > img {
		border: 1px solid var(--unfocused_border);
		object-fit: fill;
		width: 300px;
		height: 300px;
	}
	
	label > img:hover {
		outline: 1px solid var(--border);
	}
</style>
