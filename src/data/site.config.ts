interface SiteConfig {
	site: string
	author: string
	title: string
	description: string
	lang: string
	ogLocale: string
	shareMessage: string
	paginationSize: number
}

export const siteConfig: SiteConfig = {
	site: 'https://research.pages.dev/',
	author: 'daylight55',
	title: 'Research Lab Notes',
	description: 'カテゴリを横断して、仮説・出典・実務含意を軽快に探索するリサーチサイト。',
	lang: 'ja-JP',
	ogLocale: 'ja_JP',
	shareMessage: 'このレポートを共有',
	paginationSize: 6
}
