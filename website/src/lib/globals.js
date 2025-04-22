import { dev } from "$app/environment";

export const API_PORT = dev ? 5900 : 8800;
export const CDN_ADDR = dev ? "https://localhost:5900" : "https://cdn.utasuki.com";
export const LEN_LIMITS = {
	ALBUM: 255 - 5, // album name is used for the album cover's image. ext4 maximum filename length minus possible file extensions (including '.')
	GENERAL: 255,
	EMAIL: 255,
	USERNAME: 32,
	PASSWORD: 1024,
	NOTE: 1024
};
export const COOKIE_DICT = {
	AUTH_TOKEN: "auth_token",
	LANG: "language"
};
