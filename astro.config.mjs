import { defineConfig } from 'astro/config'
import mdx from '@astrojs/mdx'
import tailwind from '@astrojs/tailwind'
import { remarkReadingTime } from './src/utils/readTime.ts'
import { siteConfig } from './src/data/site.config'

const site = process.env.ASTRO_SITE ?? siteConfig.site
const base = process.env.ASTRO_BASE ?? '/'

// https://astro.build/config
export default defineConfig({
	site,
	base,
	i18n: {
		locales: ['ja', 'en'],
		defaultLocale: 'ja'
	},
	markdown: {
		remarkPlugins: [remarkReadingTime],
		drafts: true,
		shikiConfig: {
			theme: 'material-theme-palenight',
			wrap: true
		}
	},
	integrations: [
		mdx({
			syntaxHighlight: 'shiki',
			shikiConfig: {
				experimentalThemes: {
					light: 'vitesse-light',
					dark: 'material-theme-palenight'
				},
				wrap: true
			},
			drafts: true
		}),
		tailwind()
	]
})
