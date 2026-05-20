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
	site: 'https://research.daylight55.dev/',
	author: 'daylight55',
	title: 'Personal Research Atlas',
	description: 'AI、データ、組織ナレッジの調査レポートを自分向けに蓄積して読むための静的アトラス。',
	lang: 'ja-JP',
	ogLocale: 'ja_JP',
	shareMessage: 'このレポートを共有',
	paginationSize: 6
}
