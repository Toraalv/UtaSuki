<script module>
	import Alert from "$lib/Alert.svelte";
	import AnimatedDots from "$lib/AnimatedDots.svelte";

	export { inputWarning, flightPopup, resultPopup };

	let popupTimerID = $state();
	let popup = $state();
	let hidePopup = () => {
		if (popup != null) {
			popup.style.display = "none";
			clearTimeout(popupTimerID);
		}
	};
	let popupTimer = () => popupTimerID = setTimeout(() => hidePopup(), 2000);
</script>

{#snippet inputWarning(err, msg)}
	{#if err}
		<tr>
			<td style="padding-top: 0;"></td>
			<td style="padding-top: 0; color: var(--warning)">{msg}</td>
		</tr>
	{/if}
{/snippet}

{#snippet flightPopup(inFlight, code, msg)}
	{#if inFlight}
		<div class="overlay" style:cursor="unset">
			<Alert code={code} mainStyle="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -100%); z-index: 2; min-width: 15vw;">
				<p>{msg}</p><AnimatedDots/>
			</Alert>
		</div>
	{/if}
{/snippet}

{#snippet resultPopup(form, href)}
	{#if form}
		<a bind:this={popup} use:popupTimer class="overlay" onclick={() => hidePopup()} href={href}>
			<Alert code={form.code} mainStyle="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -100%); z-index: 2"/>
		</a>
	{/if}
{/snippet}
