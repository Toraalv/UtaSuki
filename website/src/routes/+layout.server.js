import { UtaSuki_API } from "$lib/api.js";
import { COOKIE_DICT } from "$lib/globals.js";
import { browser } from "$app/environment";
import "$lib/i18n";
import { locale, waitLocale } from "svelte-i18n";

const api = new UtaSuki_API();

/** @type {import('./$types').PageServerLoad} */
export async function load({ fetch, cookies, params, url }) {
	// unfortunately this does not get applied when logging in, which may confuse users
	let res = await api.auth(fetch)
	if (cookies.get(COOKIE_DICT.LANG) == undefined) {
		let savedLang = res.auth_info?.profile?.language;
		if (savedLang != undefined) {
			cookies.set(COOKIE_DICT.LANG, savedLang, {
				path: '/',
				httpOnly: false,
				secure: true,
				sameSite: "None"
			});
			locale.set(savedLang);
			await waitLocale();
		} else if (browser) {
			locale.set(window.navigator.language);
			await waitLocale();
		}
	}

	let borderRadius = res.auth_info?.profile?.border_radius;
	if (borderRadius != undefined) {
		cookies.set(COOKIE_DICT.BORDER, borderRadius, {
			path: '/',
			httpOnly: false,
			secure: true,
			sameSite: "None"
		});
	}

	let bodyMargin = res.auth_info?.profile?.body_margin;
	if (bodyMargin != undefined) {
		cookies.set(COOKIE_DICT.BODY_MARGIN, bodyMargin, {
			path: '/',
			httpOnly: false,
			secure: true,
			sameSite: "None"
		});
	}

	return res;
}
