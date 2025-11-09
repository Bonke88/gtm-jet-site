export default {
  // Site configuration
  site: {
    name: 'GTM Jet',
    domain: 'gtmejet.com',
    niche: 'gtm', // revops or gtm
    contentDir: 'src/content/guides'
  },

  // SEObot.ai configuration
  seobot: {
    apiKey: process.env.SEOBOT_API_KEY,
    projectId: process.env.SEOBOT_PROJECT_ID,
    contentType: 'blog-post',
    autoPublish: true,
    settings: {
      wordCount: { min: 1500, max: 2500 },
      tone: 'professional',
      includeImages: false,
      includeFAQ: true,
      includeTableOfContents: true
    }
  },

  // Outrank.so configuration (optional)
  outrank: {
    apiKey: process.env.OUTRANK_API_KEY,
    workflow: 'seo-article',
    qualityScore: 80, // Minimum quality threshold
    autoOptimize: true,
    settings: {
      depth: 'comprehensive',
      researchLevel: 'medium'
    }
  },

  // Content ingestion settings
  ingestion: {
    checkInterval: '0 0 * * *', // Daily at midnight
    batchSize: 5, // Process 5 articles at a time
    reviewRequired: false, // Auto-publish without review
    minQualityScore: 75
  },

  // Keyword targeting for GTM niche
  keywords: [
    { keyword: 'salesforce automation workflows', difficulty: 45, priority: 'high' },
    { keyword: 'hubspot sales sequences', difficulty: 38, priority: 'high' },
    { keyword: 'outreach vs salesloft', difficulty: 42, priority: 'high' },
    { keyword: 'apollo io lead generation', difficulty: 35, priority: 'medium' },
    { keyword: 'sales pipeline automation', difficulty: 48, priority: 'high' },
    { keyword: 'gong conversation intelligence', difficulty: 40, priority: 'medium' },
    { keyword: 'clearbit enrichment', difficulty: 38, priority: 'medium' },
    { keyword: 'zoominfo data quality', difficulty: 35, priority: 'medium' }
  ]
};
