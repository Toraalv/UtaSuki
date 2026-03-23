import { locale } from "svelte-i18n";
import { COOKIE_DICT } from "$lib/globals.js";

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ fetch, cookies, event, resolve }) {
	const langCookie = event.request.headers.get("cookie")?.split("; ").find(cookie => cookie.startsWith(`${COOKIE_DICT.LANG}=`));
	if (langCookie)
		locale.set(langCookie.split("=")[1]);
	return resolve(event);
}
