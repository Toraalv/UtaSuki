<script>
	import Alert from "$lib/Alert.svelte";
	import SwayWindow from "$lib/SwayWindow.svelte";
	import { page } from '$app/state';
</script>

<Alert mainStyle="margin-top: 33vh;" severity="error" code={"error." + page.status}/>

