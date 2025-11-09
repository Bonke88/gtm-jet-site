import { defineCollection, z } from 'astro:content';

const guidesCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().max(160),
    tool: z.enum(['salesforce', 'hubspot', 'marketo', 'pardot', 'outreach', 'salesloft', 'gong', 'apollo', 'clay', 'clearbit', 'zoominfo', 'zapier', 'make']),
    useCase: z.enum(['lead-generation', 'sales-enablement', 'account-based-marketing', 'sales-automation', 'pipeline-management', 'revenue-intelligence', 'data-enrichment', 'lead-routing']),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
    timeToImplement: z.number(),
    publishDate: z.date(),
    lastUpdated: z.date(),
    aiGenerated: z.boolean().default(false),
    source: z.string().optional(),
    targetKeyword: z.string().optional(),
  })
});

export const collections = {
  guides: guidesCollection
};
