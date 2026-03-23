import { UtaSuki_API } from "$lib/api.js";
import { fail, redirect } from "@sveltejs/kit";

const api = new UtaSuki_API();

export const actions = {
	updateSettings: async ({ fetch, cookies, request }) => {
		const form = await request.formData();

		let res = await api.updateSettings(fetch, form);

		if (res.code.split('.')[0] == "success")
			return res;
		else
			return fail(500, res);
	},
	deleteAccount: async ({ fetch, cookies, request }) => {
		const form = await request.formData();

		let res = await api.deleteAccount(fetch, form);

		if (res.code.split('.')[0] == "success")
			return res;
		else
			return fail(500, res);
	}
};
