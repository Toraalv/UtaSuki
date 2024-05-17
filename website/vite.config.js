import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig(() => {
	const PORT = process.env.APP_ENV == "dev" ? 5901 : 8801;
	return {
		plugins: [sveltekit()],
		test: {
			include: ['src/**/*.{test,spec}.{js,ts}']
		},
		server: { port: PORT }
	}
});
