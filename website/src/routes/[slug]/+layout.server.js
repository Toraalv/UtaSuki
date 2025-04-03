import { UtaSuki_API } from "$lib/api.js";

/** @type {import('./$types').PageServerLoad} */
export async function load({ fetch, params, url }) {
	return await new UtaSuki_API().fetchYears(fetch, url.pathname.split("/")[1]); // a one liner, but at what cost?
}
