module.exports = {
	content: ['./src/**/*.{astro,html,js,jsx,md,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			aspectRatio: {
				og: '1200 / 630'
			}
		},
	},
	plugins: [require("@tailwindcss/typography"), require("daisyui")],
}
