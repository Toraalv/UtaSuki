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

	const authToken = cookies.get("auth_token");

	// ask api if token is ok (sends back some data too if it's ok)
	let authTokenInfo = await api.verifyAuthToken(fetch, authToken);

	console.log(authTokenInfo);

	return { users: await api.fetchUsers(fetch), authToken };
}

export const actions = {
	login: async ({ fetch, cookies, request }) => {
		const data = await request.formData();

		let res = await api.login(fetch, data);

		if (!res.error)
			cookies.set("auth_token", res.data.token, { path: '/' });

		return { res };
	}
};
