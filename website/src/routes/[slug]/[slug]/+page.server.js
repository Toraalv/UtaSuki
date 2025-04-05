import { UtaSuki_API } from "$lib/api.js";
import { page } from "$app/stores";

/** @type {import('./$types').PageServerLoad} */
export async function load({ fetch, params, url }) {
	return { tracks: await new UtaSuki_API().fetchTracks(fetch, url.pathname.split("/")[1], params.slug) };
}
