<script>
	import SwayWindow from "$lib/SwayWindow.svelte";
	import { _ } from "svelte-i18n";

	let years = Array.from({ length: 2024 - 2017 + 1 }, (_, i) => 2024 - i);
	let months = Array.from({ length: 12 - 0 }, (_, i) => 0 + i);
	console.log(months);
</script>

<SwayWindow title="{$_('general.add_track')}" altTitle="{$_('general.add_track')}" mainStyle="margin: auto; margin-top: 1rem;">
	<form method="post" enctype="multipart/form-data" action="/addTrack">
		<div>
			<label for="imageSelect"><img src="/add_image_placeholder.webp" id="placeholderImg" alt="input album"><input type="file" name="file" accept="image/*" id="imageSelect"></label>
			<table cellpadding="5" cellspacing="0" id="trackFormInfo">
				<tbody>
					<tr>
						<td>year:</td>
						<td>
							<select id="select_year" name="selected_year" required>
								{#each years as year}
									<option value="{year}">{year}</option>
								{/each}
							</select>
						</td>
					</tr>
						<td>month:</td>
						<td>
							<select id="select_month" name="selected_month" required>
								{#each months as month}
									<option value="{month + 1}">{$_(`months.${month}`)}</option>
								{/each}
							</select>
						</td>
					<tr>
					</tr>
					<tr>
						<td>track name:</td>
						<td>
							<input type="text" name="track" autocomplete="off" required>
						</td>
					</tr>
					<tr>
						<td>artist name:</td>
						<td>
							<input type="text" name="artist" autocomplete="off" required>
						</td>
					</tr>
					<tr>
						<td>album name:</td>
						<td>
							<input type="text" name="album" autocomplete="off" required>
						</td>
					</tr>
					<tr>
						<td>description:</td>
						<td>
							<textarea name="description" rows="3" autocomplete="off"></textarea>
						</td>
					</tr>
				</tbody>
			</table>
		</div>
		<input type="submit" value="{$_('general.add')}" id="addBtn">
	</form>
</SwayWindow>

<style>
	form {
		box-sizing: border-box; /* でもさ～、何で？ */
	}
	
	* {
		box-sizing: inherit;
	}
	
	input:focus, textarea:focus {
		outline: 0;
	}
	
	input[type="file"] {
		display: none;
	}
	label {
		width: auto;
		height: 100%;
	}
	label > img {
		border: 1px solid var(--unfocused_border);
		object-fit: fill;
	}
	
	label > img:hover {
		outline: 1px solid var(--border);
	}

	div {
		display: flex;
		flex-direction: row;
	}

	table {
		width: 100%;
	}

	input, select, textarea {
		margin: 0;
		font-size: 18px;
		background-color: #111;
		border: 1px solid var(--unfocused_border);
		color: var(--text);
		width: 100%;
		resize: none;
	}
</style>
