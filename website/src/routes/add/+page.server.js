import { UtaSuki_API } from "$lib/api.js";

const api = new UtaSuki_API();

export const actions = {
	addTrack: async ({ fetch, cookies, request }) => {
		const data = await request.formData();

		let res = await api.postTrack(fetch, data);

		return { res };
	}
};
