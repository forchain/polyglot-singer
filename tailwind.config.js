/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			fontFamily: {
				sans: ['Inter', 'system-ui', 'sans-serif'],
				mono: ['Fira Code', 'monospace']
			},
			colors: {
				primary: {
					50: '#f0f9ff',
					500: '#3b82f6',
					600: '#2563eb',
					700: '#1d4ed8',
					900: '#1e3a8a'
				}
			},
			spacing: {
				'lyric-gap': '0.75rem'
			}
		}
	},
	plugins: [
		require('@tailwindcss/forms'),
		require('@tailwindcss/typography')
	]
}; 