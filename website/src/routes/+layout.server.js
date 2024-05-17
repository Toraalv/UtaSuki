import { UtaSuki_API } from "$lib/api.js";

export async function load({ fetch, params }) {
	let api = new UtaSuki_API();
	let years = await api.fetchYears();

	return { years };
}
