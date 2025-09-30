import { defineCollection, z } from 'astro:content'
import { file, glob } from 'astro/loaders'

const stories = defineCollection({
  loader: glob({ pattern: "*.md", base: 'src/stories'}),
  schema: z.object({
    order: z.number(),
    prefix: z.string(),
    title: z.string(),
    title_short: z.string(),
    illustration: z.string(),
    opengraphImage: z.string().optional(),
    description: z.string(),
    intro: z.string(),
    events: z.array(
      z.object({
        id: z.string(),
        date: z.string().optional(),
        title: z.string().optional(),
        headline: z.string().optional(),
        summary: z.string().optional(),
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
    }).optional(),
  })
})

const events = defineCollection({
  loader: file("src/data/events.json"),
  schema: z.object({
    id: z.string(),
    date: z.string(),
    headline: z.string(),
    summary: z.string(),
    area: z.array(z.string()),
    campaign: z.array(z.string()),
    city: z.string(),
    country: z.array(z.string()),
    region: z.array(z.string()),
    target: z.array(z.string()),
    sources: z.array(
      z.object({
        url: z.string(),
        domain: z.string(),
      })
    ),
    x: z.number(),
    y: z.number(),
  })
})

export const collections = { stories, events }