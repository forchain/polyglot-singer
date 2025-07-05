import vercel from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),

	kit: {
		adapter: vercel(), // 👈 Vercel adapter
		alias: {
			$lib: 'src/lib'
		},
		serviceWorker: {
			register: false
		}
	}
};

export default config;