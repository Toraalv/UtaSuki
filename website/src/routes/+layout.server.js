import { UtaSuki_API } from "$lib/api.js";
import { COOKIE_DICT, CDN_ADDR } from "$lib/globals.js";
import { browser } from "$app/environment";
import "$lib/i18n";
import { locale, waitLocale } from "svelte-i18n";

const api = new UtaSuki_API();

/** @type {import('./$types').PageServerLoad} */
export async function load({ fetch, cookies, params, url }) {
	let res = await api.auth(fetch);
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

	if (res.auth_info?.authed) {
		cookies.set(COOKIE_DICT.BORDER,			res.auth_info?.profile?.border_radius,	{ path: '/', httpOnly: false, secure: true, sameSite: "None" });
		cookies.set(COOKIE_DICT.BODY_MARGIN,	res.auth_info?.profile?.body_margin,	{ path: '/', httpOnly: false, secure: true, sameSite: "None" });
		cookies.set(COOKIE_DICT.ACCENT,			res.auth_info?.profile?.accent,			{ path: '/', httpOnly: false, secure: true, sameSite: "None" });
		cookies.set(COOKIE_DICT.ACCENT_TEXT,	res.auth_info?.profile?.accent_text,	{ path: '/', httpOnly: false, secure: true, sameSite: "None" });
		cookies.set(COOKIE_DICT.ANIMATIONS,		res.auth_info?.profile?.animations,		{ path: '/', httpOnly: false, secure: true, sameSite: "None" });
		cookies.set(COOKIE_DICT.OPACITY,		res.auth_info?.profile?.opacity,		{ path: '/', httpOnly: false, secure: true, sameSite: "None" });
	}

	return res;
}
