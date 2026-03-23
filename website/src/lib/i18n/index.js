import { COOKIE_DICT } from "$lib/globals.js";
import { getCookie } from "$lib/helpers.js";

import { browser } from "$app/environment";
import { addMessages, init, register } from "svelte-i18n";

const defaultLocale = "en";

import en from "./en.json";
import sv from "./sv.json";

addMessages("en", en);
addMessages("sv", sv);

init({
	fallbackLocale: defaultLocale,
	initialLocale: browser ? getCookie(COOKIE_DICT.LANG) : defaultLocale
});
