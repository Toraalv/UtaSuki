import { redirect } from "@sveltejs/kit";

/** @type {import('./$types').PageServerLoad} */
export function load({ locals }) {
	redirect(307, "/");
}
