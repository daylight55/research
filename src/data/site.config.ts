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
	site: 'https://daylight55.dev/',
	author: 'daylight55',
	title: 'Daylight Research Atlas',
	description: 'AI、データ、組織ナレッジの調査レポートを読むための静的リサーチアトラス。',
	lang: 'ja-JP',
	ogLocale: 'ja_JP',
	shareMessage: 'このレポートを共有',
	paginationSize: 6
}
