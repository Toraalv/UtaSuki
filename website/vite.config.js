import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import fs from "fs";

export default defineConfig(() => {
	const PORT = process.env.APP_ENV == "dev" ? 5901 : 8801;

	if (process.env.APP_ENV == "dev") {
		return {
			plugins: [sveltekit()],
			test: {
				include: ['src/**/*.{test,spec}.{js,ts}']
			},
			server: {
				port: PORT,
				https: {
					key: fs.readFileSync("cert/localhost-key.pem"),
					cert: fs.readFileSync("cert/localhost.pem")
				}
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
					key:  fs.readFileSync(process.env.HOME + "/.certs/utasuki.com/privkey.pem"),
					cert: fs.readFileSync(process.env.HOME + "/.certs/utasuki.com/cert.pem")
				},

			},
			preview: { port: PORT }
		}
	}
});
