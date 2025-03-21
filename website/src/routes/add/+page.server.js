import { UtaSuki_API } from "$lib/api.js";

const api = new UtaSuki_API();

/** @type {import('./$types').PageServerLoad} */
export async function load({ fetch, params, cookies }) {
	return { res: await api.auth(fetch) };
}

export const actions = {
	addTrack: async ({ fetch, cookies, request }) => {
		const data = await request.formData();

		let res = await api.postTrack(fetch, data);

		return { res };
	}
};
