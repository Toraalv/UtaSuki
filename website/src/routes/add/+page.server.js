import { UtaSuki_API } from "$lib/api.js";

export const actions = {
	default: async ({ fetch, cookies, request }) => {
		const data = await request.formData();

		let api = new UtaSuki_API();
		let res = await api.postTrack(fetch, data);

		return { res };
	}
};
