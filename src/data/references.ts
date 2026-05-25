import type { Locale } from '@/utils'

export const REFERENCE_ITEMS = [
	{
		href: '/reference/statistical-sources',
		title: {
			ja: '国別調査に使う統計・データソース一覧',
			en: 'Statistics and data sources for country research'
		},
		description: {
			ja: 'World Bank、IMF、UN、SIPRI、V-Dem、UNHCRなど、国際政治・経済・人口・安全保障・生活水準を比較するための主要データベースを整理した常設リファレンス。',
			en: 'A standing reference for comparing international politics, economics, demographics, security, and living standards with sources such as World Bank, IMF, UN, SIPRI, V-Dem, and UNHCR.'
		}
	},
	{
		href: '/reference/trend-research-source-map',
		title: {
			ja: '技術トレンド調査に使う情報源マップ',
			en: 'Source map for technology trend research'
		},
		description: {
			ja: 'AI、開発者ツール、セキュリティ、半導体、政策・規制の変化を日次で追うための公式発表、RSS/API、研究・実装シグナルを整理した参照ページ。',
			en: 'A reference page that organizes official announcements, RSS and API feeds, research and implementation signals for tracking AI, developer tools, security, semiconductors, policy, and regulation.'
		}
	}
] as const

export function getReferenceItems(locale: Locale = 'ja') {
	return REFERENCE_ITEMS.map((item) => ({
		href: item.href,
		title: item.title[locale],
		description: item.description[locale]
	}))
}
