import { locale } from "svelte-i18n";
import { COOKIE_DICT } from "$lib/globals.js";

// https://stackoverflow.com/a/25490531
export const getCookie = (name) => (document.cookie.match("(^|;)\\s*" + name + "\\s*=\\s*([^;]+)")?.pop() || "");

export function setLang(lang) {
	locale.set(lang);
	document.cookie = `${COOKIE_DICT.LANG}=${lang}; path=/`;
}
