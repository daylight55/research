import type { CATEGORIES } from '@/data/categories'

type Category = (typeof CATEGORIES)[number]

const categorySurfaceClasses: Record<Category, string> = {
	'ai-systems': 'bg-sky-50/80 hover:bg-sky-50 dark:bg-sky-950/35 dark:hover:bg-sky-950/45',
	'enterprise-ai-platforms':
		'bg-indigo-50/80 hover:bg-indigo-50 dark:bg-indigo-950/35 dark:hover:bg-indigo-950/45',
	'developer-tools': 'bg-cyan-50/80 hover:bg-cyan-50 dark:bg-cyan-950/35 dark:hover:bg-cyan-950/45',
	'knowledge-systems':
		'bg-emerald-50/80 hover:bg-emerald-50 dark:bg-emerald-950/35 dark:hover:bg-emerald-950/45',
	'philosophy-knowledge':
		'bg-violet-50/80 hover:bg-violet-50 dark:bg-violet-950/35 dark:hover:bg-violet-950/45',
	'data-infrastructure':
		'bg-teal-50/80 hover:bg-teal-50 dark:bg-teal-950/35 dark:hover:bg-teal-950/45',
	'tech-news': 'bg-amber-50/85 hover:bg-amber-50 dark:bg-amber-950/35 dark:hover:bg-amber-950/45',
	'semiconductor-memory':
		'bg-rose-50/80 hover:bg-rose-50 dark:bg-rose-950/35 dark:hover:bg-rose-950/45',
	'macro-finance': 'bg-lime-50/80 hover:bg-lime-50 dark:bg-lime-950/35 dark:hover:bg-lime-950/45',
	geopolitics: 'bg-stone-100/80 hover:bg-stone-100 dark:bg-stone-900/45 dark:hover:bg-stone-900/60',
	'real-estate':
		'bg-orange-50/80 hover:bg-orange-50 dark:bg-orange-950/35 dark:hover:bg-orange-950/45'
}

const categoryAccentClasses: Record<Category, string> = {
	'ai-systems': 'border-sky-200/80 text-sky-800 dark:border-sky-800/60 dark:text-sky-200',
	'enterprise-ai-platforms':
		'border-indigo-200/80 text-indigo-800 dark:border-indigo-800/60 dark:text-indigo-200',
	'developer-tools': 'border-cyan-200/80 text-cyan-800 dark:border-cyan-800/60 dark:text-cyan-200',
	'knowledge-systems':
		'border-emerald-200/80 text-emerald-800 dark:border-emerald-800/60 dark:text-emerald-200',
	'philosophy-knowledge':
		'border-violet-200/80 text-violet-800 dark:border-violet-800/60 dark:text-violet-200',
	'data-infrastructure':
		'border-teal-200/80 text-teal-800 dark:border-teal-800/60 dark:text-teal-200',
	'tech-news': 'border-amber-200/80 text-amber-800 dark:border-amber-800/60 dark:text-amber-200',
	'semiconductor-memory':
		'border-rose-200/80 text-rose-800 dark:border-rose-800/60 dark:text-rose-200',
	'macro-finance': 'border-lime-200/80 text-lime-800 dark:border-lime-800/60 dark:text-lime-200',
	geopolitics: 'border-stone-300/80 text-stone-800 dark:border-stone-700/70 dark:text-stone-200',
	'real-estate':
		'border-orange-200/80 text-orange-800 dark:border-orange-800/60 dark:text-orange-200'
}

export const getCategorySurfaceClass = (category: Category) => categorySurfaceClasses[category]

export const getCategoryAccentClass = (category: Category) => categoryAccentClasses[category]
