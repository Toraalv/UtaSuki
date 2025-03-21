import { UtaSuki_API } from "$lib/api.js";

/** @type {import('./$types').PageServerLoad} */
export async function load({ fetch, params, url }) {
	let api = new UtaSuki_API();
	let res = await api.fetchYears(fetch, url.pathname.split("/")[1]);

	return { res };
}
