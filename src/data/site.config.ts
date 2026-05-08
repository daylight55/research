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
	title: 'Nocturne Research Desk',
	description: '重めのAI/データ基盤レポートを、暗色の分析デスクとして読むAstroサイト。',
	lang: 'ja-JP',
	ogLocale: 'ja_JP',
	shareMessage: 'このレポートを共有',
	paginationSize: 6
}
