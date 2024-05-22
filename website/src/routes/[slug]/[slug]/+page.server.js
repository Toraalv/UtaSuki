import { UtaSuki_API } from "$lib/api.js";
import { page } from "$app/stores";

/** @type {import('./$types').PageServerLoad} */
export async function load({ fetch, params, url }) {
	let api = new UtaSuki_API();
	let monthTracks = await api.fetchTracks(fetch, url.pathname.split("/")[1], params.slug);

	return { monthTracks };
}
