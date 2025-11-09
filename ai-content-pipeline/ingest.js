/**
 * AI Content Ingestion Script
 * Fetches articles from SEObot.ai and Outrank.so and saves them as Markdown files
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { fetchSeobotContent, generateSeobotArticle } from './lib/seobot-client.js';
import { fetchOutrankContent, generateOutrankArticle } from './lib/outrank-client.js';
import config from './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Convert article to Markdown with Astro frontmatter
 */
function formatAsMarkdown(article) {
  const date = article.publishedAt.toISOString().split('T')[0];

  // Create frontmatter
  const frontmatter = `---
title: "${article.title.replace(/"/g, '\\"')}"
description: "${extractDescription(article.content)}"
tool: "${inferTool(article.metadata.keyword)}"
useCase: "${inferUseCase(article.metadata.keyword)}"
difficulty: "intermediate"
timeToImplement: 60
publishDate: ${date}
lastUpdated: ${date}
aiGenerated: true
source: "${article.source}"
targetKeyword: "${article.metadata.keyword}"
---

${article.content}

---

*This article was generated using ${article.source === 'seobot' ? 'SEObot.ai' : 'Outrank.so'} on ${date}.*
`;

  return frontmatter;
}

/**
 * Extract first 160 characters as description
 */
function extractDescription(content) {
  // Remove markdown headers and get first paragraph
  const cleaned = content
    .replace(/^#+\s+.*$/gm, '')
    .replace(/\n\n+/g, '\n')
    .trim();

  const firstParagraph = cleaned.split('\n')[0];
  const description = firstParagraph.substring(0, 157);

  return description.length < firstParagraph.length
    ? description + '...'
    : description;
}

/**
 * Infer tool from keyword
 */
function inferTool(keyword) {
  const toolMap = {
    'zapier': 'zapier',
    'make': 'make',
    'n8n': 'n8n',
    'clay': 'clay'
  };

  for (const [key, value] of Object.entries(toolMap)) {
    if (keyword.toLowerCase().includes(key)) {
      return value;
    }
  }

  return 'zapier'; // Default
}

/**
 * Infer use case from keyword
 */
function inferUseCase(keyword) {
  const useCaseMap = {
    'enrichment': 'data-enrichment',
    'workflow': 'workflow-automation',
    'automation': 'workflow-automation',
    'integration': 'api-orchestration',
    'routing': 'lead-routing'
  };

  for (const [key, value] of Object.entries(useCaseMap)) {
    if (keyword.toLowerCase().includes(key)) {
      return value;
    }
  }

  return 'workflow-automation'; // Default
}

/**
 * Generate slug from title
 */
function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/**
 * Track content costs
 */
function trackCost(costData) {
  const costFile = path.join(__dirname, '../experiment-data/costs.json');

  let costs = {};
  if (fs.existsSync(costFile)) {
    costs = JSON.parse(fs.readFileSync(costFile, 'utf-8'));
  }

  if (!costs.articles) {
    costs.articles = [];
  }

  costs.articles.push(costData);
  costs.totalCost = costs.articles.reduce((sum, item) => sum + item.cost, 0);
  costs.lastUpdated = new Date().toISOString();

  fs.writeFileSync(costFile, JSON.stringify(costs, null, 2));
}

/**
 * Main ingestion function
 */
async function ingestContent() {
  console.log('Starting AI content ingestion...');

  try {
    // Fetch new articles from SEObot.ai
    console.log('Fetching articles from SEObot.ai...');
    const seobotArticles = await fetchSeobotContent();
    console.log(`Found ${seobotArticles.length} articles from SEObot`);

    // Fetch new articles from Outrank.so
    console.log('Fetching articles from Outrank.so...');
    const outrankArticles = await fetchOutrankContent();
    console.log(`Found ${outrankArticles.length} articles from Outrank`);

    // Combine all articles
    const allArticles = [...seobotArticles, ...outrankArticles];

    if (allArticles.length === 0) {
      console.log('No new articles to publish. Generating from keyword queue...');

      // Generate new articles from keyword queue
      const keywordsToGenerate = config.keywords
        .filter(k => k.priority === 'high')
        .slice(0, config.ingestion.batchSize);

      for (const keywordConfig of keywordsToGenerate) {
        try {
          console.log(`Generating article for: ${keywordConfig.keyword}`);

          // Alternate between SEObot and Outrank
          const useOutrank = Math.random() > 0.5;
          const article = useOutrank
            ? await generateOutrankArticle(keywordConfig.keyword)
            : await generateSeobotArticle(keywordConfig.keyword);

          allArticles.push(article);
        } catch (error) {
          console.error(`Failed to generate article for ${keywordConfig.keyword}:`, error);
        }
      }
    }

    // Process and save articles
    let savedCount = 0;
    for (const article of allArticles.slice(0, config.ingestion.batchSize)) {
      try {
        // Convert to Markdown with frontmatter
        const markdown = formatAsMarkdown(article);

        // Generate slug
        const slug = slugify(article.title);

        // Ensure content directory exists
        const contentDir = path.join(__dirname, '..', config.site.contentDir);
        if (!fs.existsSync(contentDir)) {
          fs.mkdirSync(contentDir, { recursive: true });
        }

        // Write to content directory
        const filePath = path.join(contentDir, `${slug}.md`);
        fs.writeFileSync(filePath, markdown);
        console.log(`✓ Saved: ${slug}.md`);

        // Track costs
        trackCost({
          slug,
          source: article.source,
          cost: article.cost,
          wordCount: article.metadata.wordCount,
          keyword: article.metadata.keyword,
          publishDate: article.publishedAt.toISOString()
        });

        savedCount++;
      } catch (error) {
        console.error(`Error saving article "${article.title}":`, error);
      }
    }

    console.log(`\n✓ Ingestion complete! Saved ${savedCount} articles.`);

    // Create experiment-data directory if it doesn't exist
    const expDir = path.join(__dirname, '../experiment-data');
    if (!fs.existsSync(expDir)) {
      fs.mkdirSync(expDir, { recursive: true });
    }

    return savedCount;

  } catch (error) {
    console.error('Error during content ingestion:', error);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  ingestContent()
    .then(count => {
      console.log(`\nIngestion completed successfully. ${count} articles published.`);
      process.exit(0);
    })
    .catch(error => {
      console.error('\nIngestion failed:', error);
      process.exit(1);
    });
}

export { ingestContent };
