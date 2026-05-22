import type { CATEGORIES } from '@/data/categories'

type Category = (typeof CATEGORIES)[number]

const articleCardSurfaceClass =
	'bg-stone-100/80 hover:bg-stone-100 dark:bg-stone-900/45 dark:hover:bg-stone-900/60'

const articleCardAccentClass =
	'border-stone-300/80 text-stone-800 dark:border-stone-700/70 dark:text-stone-200'

export const getCategorySurfaceClass = (_category: Category) => articleCardSurfaceClass

export const getCategoryAccentClass = (_category: Category) => articleCardAccentClass
