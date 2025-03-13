import { UtaSuki_API } from "$lib/api.js";
import { browser } from "$app/environment";
import { locale, waitLocale } from "svelte-i18n";

const api = new UtaSuki_API();

/** @type {import('./$types').PageServerLoad} */
export async function load({ fetch, params, cookies }) {
	if (browser) {
		locale.set(window.navigator.language);
	}
	await waitLocale();

	return { res: await api.fetchUsers(fetch) };
}

export const actions = {
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
	}
};
