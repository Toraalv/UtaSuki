import { UtaSuki_API } from "$lib/api.js";
import { redirect } from "@sveltejs/kit";

const api = new UtaSuki_API();

/** @type {import('./$types').PageServerLoad} */
export async function load({ fetch, params, cookies }) {
	let res = await api.auth(fetch);

	if (res.code.split('.')[0] == "error" || !res.auth_info.authed)
		redirect(307, '/');

	return res;
}

