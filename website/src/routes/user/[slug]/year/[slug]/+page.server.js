import { UtaSuki_API } from "$lib/api.js";
import { page } from "$app/stores";

const api = new UtaSuki_API();

/** @type {import('./$types').PageServerLoad} */
export async function load({ fetch, params, url }) {
	return { tracks: await api.fetchTracks(fetch, url.pathname.split("/")[2], params.slug) };
}

export const actions = {
	deleteTrack: async ({ fetch, cookies, request }) => {
		const data = await request.formData();

		return await api.deleteTrack(fetch, data);
	}
};

