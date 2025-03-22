import { UtaSuki_API } from "$lib/api.js";
import { redirect } from "@sveltejs/kit";

const api = new UtaSuki_API();

/** @type {import('./$types').PageServerLoad} */
export async function load({ fetch, params, cookies }) {
	return { res: await api.fetchUsers(fetch) };
}

export const actions = {
	register: () => {
	},
	login: async ({ fetch, cookies, request }) => {
		const data = await request.formData();

		let res = await api.login(fetch, data);

		if (!res.error)
			cookies.set("auth_token", res.data.token, { path: '/' });

		return { res };
	},
	logout: ({ fetch, cookies }) => {
		// do or die
		api.logout(fetch);
		cookies.set("auth_token", "", { path: '/' });
		redirect(303, '/');
	}
};
