import { UtaSuki_API } from "$lib/api.js";
import { browser } from "$app/environment";
import { locale, waitLocale } from "svelte-i18n";

const api = new UtaSuki_API();

/** @type {import('./$types').PageServerLoad} */
export async function load({ fetch, params }) {
	if (browser) {
		locale.set(window.navigator.language);
	}
	await waitLocale();

	return { users: await api.fetchUsers(fetch) };
}

export const actions = {
	login: async ({ fetch, cookies, request }) => {
		const data = await request.formData();

		let res = await api.login(fetch, data);

		console.log(res);

		return { res };
	}
};
