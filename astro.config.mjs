import { defineConfig } from 'astro/config'
import mdx from '@astrojs/mdx'
import tailwind from '@astrojs/tailwind'
import { remarkReadingTime } from './src/utils/readTime.ts'
import { remarkGlossary } from './src/utils/remarkGlossary.ts'
import { siteConfig } from './src/data/site.config'

const site = process.env.ASTRO_SITE ?? siteConfig.site
const base = process.env.ASTRO_BASE ?? '/'
const astroCacheDir = process.env.ASTRO_CACHE_DIR
const viteCacheDir = process.env.VITE_CACHE_DIR

// https://astro.build/config
export default defineConfig({
	site,
	base,
	...(astroCacheDir ? { cacheDir: astroCacheDir } : {}),
	...(viteCacheDir ? { vite: { cacheDir: viteCacheDir } } : {}),
	i18n: {
		locales: ['ja', 'en'],
		defaultLocale: 'ja'
	},
	markdown: {
		remarkPlugins: [remarkReadingTime, remarkGlossary],
		drafts: true,
		shikiConfig: {
			theme: 'material-theme-palenight',
			wrap: true
		}
	},
	integrations: [
		mdx({
			remarkPlugins: [remarkGlossary],
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
