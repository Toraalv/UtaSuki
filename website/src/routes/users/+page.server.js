import { UtaSuki_API } from "$lib/api.js";
import { redirect } from "@sveltejs/kit";

const api = new UtaSuki_API();

/** @type {import('./$types').PageServerLoad} */
export async function load({ fetch }) {
	return await api.fetchUsers(fetch);
}
