import { UtaSuki_API } from "$lib/api.js";

/** @type {import('./$types').PageServerLoad} */
export async function load({ fetch, params }) {
	let api = new UtaSuki_API();
	let monthTracks = await api.fetchTracks(fetch, params.slug);

	return { monthTracks };
}
