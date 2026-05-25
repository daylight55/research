import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'
import { z } from 'astro/zod'
import { CATEGORIES } from '@/data/categories'

const blog = defineCollection({
	loader: glob({ base: './articles', pattern: '**/index.{md,mdx}' }),
	schema: ({ image }) =>
		z.object({
			title: z.string().max(80),
			description: z.string(),
			rssSummary: z.string().optional(),
			heroImageQuery: z.string().optional(),
			pubDate: z.coerce.date(),
			heroImage: image(),
			heroImageAlt: z.string().optional(),
			heroImageCredit: z.string().optional(),
			heroImageCreditUrl: z.string().url().optional(),
			heroImageSourceId: z.string().optional(),
			contentType: z.enum(['report', 'news']).default('report'),
			category: z.enum(CATEGORIES),
			tags: z.array(z.string()),
			draft: z.boolean().default(false)
		})
})

const articleResearch = defineCollection({
	loader: glob({ base: './articles', pattern: '**/research-log.{md,mdx}' }),
	schema: z.object({
		title: z.string().optional()
	})
})

export const collections = { blog, articleResearch }
