<script>
	import Alert from "$lib/Alert.svelte";
	import SwayWindow from "$lib/SwayWindow.svelte";
	import { page } from '$app/state';
</script>

<Alert mainStyle="margin: 10px; max-width: unset;" code={"error." + page.status}/>

