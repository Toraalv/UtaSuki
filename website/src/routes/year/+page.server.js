import { redirect } from "@sveltejs/kit";

export function load({ locals }) {
	redirect(307, "/");
}
