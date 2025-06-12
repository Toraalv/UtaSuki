import { UtaSuki_API } from "$lib/api.js";
import { redirect } from "@sveltejs/kit";

const api = new UtaSuki_API();

/** @type {import('./$types').PageServerLoad} */
export async function load({ fetch, params, cookies }) {
	return await api.fetchUsers(fetch);
}

export const actions = {
	login: async ({ fetch, cookies, request }) => {
		let form = await request.formData();

		let res = await api.login(fetch, form);

		if (res.code.split('.')[0] == "success")
			cookies.set("auth_token", res.data.token, { path: '/' });

		return { type: "login", res: res };
	},
	register: async ({ fetch, cookies, request }) => {
		return { type: "register", res: await api.register(fetch, await request.formData()) };
	},
	logout: ({ fetch, cookies }) => {
		api.logout(fetch);
		cookies.set("auth_token", "", { path: '/' });
		redirect(303, '/');
	}
};
