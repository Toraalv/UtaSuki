import { UtaSuki_API } from "$lib/api.js";
import { COOKIE_DICT } from "$lib/globals.js";
import { fail, redirect } from "@sveltejs/kit";
import fs from 'fs/promises';
import path from 'path';

const api = new UtaSuki_API();

export async function load({ fetch, params }) {
	const changelogFile = await fs.readFile(path.resolve("../changelog"), "utf-8");
	const changelog = changelogFile.split('\n').map(line => line.trim());

	const activities = await api.fetchActivity(fetch);

	return { changelog, activities };
}

export const actions = {
	login: async ({ fetch, cookies, request }) => {
		let data = await request.formData();

		if (process.env.APP_ENV == "dev")
			data.set("requestOrigin", "localhost")
		else
			data.set("requestOrigin", `${request.headers.get("x-real-ip")}, ${request.headers.get("x-forwarded-for")}`);

		let res = await api.login(fetch, data);

		if (res.code.split('.')[0] == "success")
			cookies.set("auth_token", res.data.token, { path: '/' });
		else
			return fail(500, res);

		return res;
	},
	logout: ({ fetch, cookies }) => {
		api.logout(fetch);
		cookies.set(COOKIE_DICT.AUTH_TOKEN, "", { path: '/' });
		Object.values(COOKIE_DICT).forEach(key => {
			cookies.delete(key, { path: '/' });
		});
	}
};
