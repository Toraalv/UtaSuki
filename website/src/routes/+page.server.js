import { UtaSuki_API } from "$lib/api.js";
import { redirect } from "@sveltejs/kit";

const api = new UtaSuki_API();

/** @type {import('./$types').PageServerLoad} */
export async function load({ fetch, params, cookies }) {
	return await api.fetchUsers(fetch);
}

export const actions = {
	login: async ({ fetch, cookies, request }) => {
		let data = await request.formData();

		if (process.env.APP_ENV == "dev")
			data.set("requestOrigin", "localhost")
		else
			data.set("requestorigin", `${request.headers.get("x-real-ip")}, ${request.headers.get("x-forwarded-for")}`);

		let res = await api.login(fetch, data);

		if (res.code.split('.')[0] == "success")
			cookies.set("auth_token", res.data.token, { path: '/' });

		return { type: "login", res: res };
	},
	register: async ({ fetch, cookies, request }) => {
		let data = await request.formData();

		if (process.env.APP_ENV == "dev")
			data.set("requestOrigin", "localhost")
		else
			data.set("requestorigin", `${request.headers.get("x-real-ip")}, ${request.headers.get("x-forwarded-for")}`);

		let res = await api.register(fetch, data);

		return { type: "register", res: res };
	},
	logout: ({ fetch, cookies }) => {
		api.logout(fetch);
		cookies.set("auth_token", "", { path: '/' });
		redirect(303, '/');
	}
};
