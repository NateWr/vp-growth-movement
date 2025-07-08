import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'

const stories = defineCollection({
  loader: glob({ pattern: "*.md", base: 'src/stories'}),
  schema: z.object({
    prefix: z.string(),
    title: z.string(),
    description: z.string(),
    intro: z.string(),
    events: z.array(
      z.object({
        id: z.string(),
        headline: z.string().optional(),
      })
    ),
    conclusion: z.string(),
    actions: z.array(
      z.object({
        prefix: z.string(),
        title: z.string(),
        url: z.string(),
      })
    ),
    filters: z.object({
      area: z.array(z.string()).optional(),
      campaign: z.array(z.string()).optional(),
      country: z.array(z.string()).optional(),
      dateFrom: z.string().optional(),
      dateTo: z.string().optional(),
      region: z.array(z.string()).optional(),
      search: z.string().optional(),
      target: z.array(z.string()).optional(),
    }),
  })
})

export const collections = { stories }