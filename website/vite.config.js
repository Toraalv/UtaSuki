import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import fs from "fs";

export default defineConfig(() => {
	const PORT = process.env.APP_ENV == "dev" ? 5901 : 443;

	if (process.env.APP_ENV == "dev") {
		return {
			plugins: [sveltekit()],
			test: {
				include: ['src/**/*.{test,spec}.{js,ts}']
			},
			server: {
				port: PORT
			},
			preview: { port: PORT }
		}
	} else {
		return {
			plugins: [sveltekit()],
			test: {
				include: ['src/**/*.{test,spec}.{js,ts}']
			},
			server: {
				port: PORT,
				https: {
					key:  fs.readFileSync("/etc/letsencrypt/live/utasuki.toralv.dev/privkey.pem"),
					cert: fs.readFileSync("/etc/letsencrypt/live/utasuki.toralv.dev/cert.pem")
				},

			},
			preview: { port: PORT }
		}
	}
});
