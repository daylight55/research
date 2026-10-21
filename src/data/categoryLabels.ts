const labels: Record<string, string> = {
	'africa-history': 'アフリカ史',
	'ai-market': 'AI市場・投資',
	'ai-systems': 'AI・LLM',
	'enterprise-ai-platforms': '企業向けAI',
	'developer-tools': '開発ツール',
	'knowledge-systems': '知識・記憶',
	'philosophy-knowledge': '哲学・知識論',
	'learning-science': '学習科学',
	'data-infrastructure': 'データ基盤',
	'tech-news': 'ニュース',
	'semiconductor-memory': '半導体・メモリ',
	'macro-finance': '経済・金融',
	'middle-east': '中東',
	geopolitics: '国際政治',
	'country-profiles': '国別プロファイル',
	'uk-politics': 'イギリス政治',
	'uk-history': 'イギリス史',
	'uk-culture': 'イギリス文化',
	'japan-politics': '日本政治',
	'real-estate': '住まい・不動産',
	'ancient-history': '古代史',
	'cultural-anthropology': '文化人類学',
	'music-culture': '音楽文化',
	'global-popular-music': '世界の音楽',
	'japan-religion': '日本の宗教',
	'welfare-policy': '福祉政策',
	'global-religion': '世界の宗教'
}

export function getCategoryLabel(category: string, locale = 'ja') {
	return locale === 'ja' ? (labels[category] ?? category) : category.replaceAll('-', ' ')
}
