import { UtaSuki_API } from "$lib/api.js";
import { redirect } from "@sveltejs/kit";

const api = new UtaSuki_API();

/** @type {import('./$types').PageServerLoad} */
export async function load({ fetch, params, cookies }) {
	let res = await api.auth(fetch);

	if (res.code == "error.connection_refused")
		redirect(303, '/');

	//redirect user if not logged in // this does not work as expected in some scenarios (e.g. submitting just when token expires)
	//if (!res.auth_info.authed)
	//	redirect(303, '/');

	return res;
}

export const actions = {
	addTrack: async ({ fetch, cookies, request }) => {
		const form = await request.formData();

		return await api.postTrack(fetch, form);
	}
};

