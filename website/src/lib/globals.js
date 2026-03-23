import { dev } from "$app/environment";

export const API_PORT = dev ? 5900 : 8800;
export const CDN_ADDR = dev ? "https://localhost:5900" : "https://cdn.utasuki.com";

export const IMAGE_PATH = `${CDN_ADDR}/static/images`;
export const ALBUM_PATH = `${CDN_ADDR}/static/images/album_covers`;
export const PFP_PATH = `${CDN_ADDR}/static/images/profile_pictures`;
export const BG_PATH = `${CDN_ADDR}/static/images/backgrounds`;

export const LEN_LIMITS = {
	GENERAL: 255,
	ALBUM: 1024,
	TRACK: 1024,
	ARTIST: 1024,
	EMAIL: 255,
	USERNAME: 32,
	PASSWORD: 1024,
	HEX_COLOR: 7,
	NOTE: 1024
};
export const COOKIE_DICT = {
	AUTH_TOKEN: "auth_token",
	LANG: "language",
	BORDER: "border_radius",
	ACCENT: "accent",
	ACCENT_TEXT: "accent_text",
	ANIMATIONS: "animations",
	OPACITY: "opacity",
	BLUR: "blur",
	BODY_MARGIN: "body_margin"
};
