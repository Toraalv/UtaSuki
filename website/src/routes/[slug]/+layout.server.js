import { UtaSuki_API } from "$lib/api.js";
import { browser } from "$app/environment";
import "$lib/i18n";
import { locale, waitLocale } from "svelte-i18n";

/** @type {import('./$types').PageServerLoad} */
export async function load({ fetch, params, url }) {
	if (browser) {
		locale.set(window.navigator.language);
	}
	await waitLocale();

	let api = new UtaSuki_API();
	let years = await api.fetchYears(fetch, url.pathname.split("/")[1]);

	return { years };
}
