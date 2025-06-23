import { UtaSuki_API } from "$lib/api.js";
import { fail, redirect } from "@sveltejs/kit";

const api = new UtaSuki_API();

/** @type {import('./$types').PageServerLoad} */
export async function load({ fetch, params, cookies }) {
	let res = await api.auth(fetch);

	if (res.auth_info?.authed)
		redirect(303, '/');

	return res;
}

export const actions = {
	register: async ({ fetch, cookies, request }) => {
		let data = await request.formData();

		if (process.env.APP_ENV == "dev")
			data.set("requestOrigin", "localhost")
		else
			data.set("requestorigin", `${request.headers.get("x-real-ip")}, ${request.headers.get("x-forwarded-for")}`);

		let res = await api.register(fetch, data);

		if (res.code.split('.')[0] != "success")
			return fail(400, res);

		return res;
	}
};
