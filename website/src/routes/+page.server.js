import { UtaSuki_API } from "$lib/api.js";
import { fail, redirect } from "@sveltejs/kit";
import fs from 'fs/promises';
import path from 'path';

const api = new UtaSuki_API();

/** @type {import('./$types').PageLoad} */
export async function load({ params }) {
	const changelogFile = await fs.readFile(path.resolve("../changelog"), "utf-8");
	const changelog = changelogFile.split('\n').map(line => line.trim());

	const activities = await api.fetchActivities(fetch);

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
		cookies.set("auth_token", "", { path: '/' });
	}
};
