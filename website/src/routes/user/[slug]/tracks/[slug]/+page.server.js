import { UtaSuki_API } from "$lib/api.js";
import { page } from "$app/stores";

const api = new UtaSuki_API();

export async function load({ fetch, params, url }) {
	return { tracks: await api.fetchTracksYear(fetch, url.pathname.split("/")[2], params.slug) };
}

export const actions = {
	updateTrack: async ({ fetch, cookies, request }) => {
		const form = await request.formData();

		return await api.updateTrack(fetch, form);
	},
	deleteTrack: async ({ fetch, cookies, request }) => {
		const form = await request.formData();

		return await api.deleteTrack(fetch, form);
	}
};

