import { locale } from "svelte-i18n";

const possessiveForm = (name) => {
	let currentLocale = "";
	locale.subscribe((locale) => {
		currentLocale = locale;
	});
	switch (currentLocale.substring(0, 2)) {
		case "sv": return name.endsWith("s") ? name : name + "s";
		case "en": return name + (name.endsWith('s') ? "'" : "'s");
		default: return name;
	}
}

export { possessiveForm };
