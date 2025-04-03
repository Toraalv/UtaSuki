import { UtaSuki_API } from "$lib/api.js";
import { page } from "$app/stores";
import { browser } from "$app/environment";
import "$lib/i18n";
import { locale, waitLocale } from "svelte-i18n";

/** @type {import('./$types').PageServerLoad} */
export async function load({ fetch, params, url }) {
	if (browser) {
		locale.set(window.navigator.language);
	}
	await waitLocale();

	return { tracks: await new UtaSuki_API().fetchTracks(fetch, url.pathname.split("/")[1], params.slug) };
}
