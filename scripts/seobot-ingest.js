import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SEOBOT_API_KEY = process.env.SEOBOT_API_KEY || '089a7d20-81dc-4742-86de-8738634497b6';
const SEOBOT_API_URL = 'https://api.seobotai.com/v1';

// GTM-focused keywords
const GTM_KEYWORDS = [
  'salesforce sales automation',
  'hubspot pipeline management',
  'outreach sales sequences',
  'gong conversation intelligence',
  'apollo prospecting automation',
  'salesloft cadence automation',
  'clearbit data enrichment',
  'zoominfo contact enrichment',
  'revenue intelligence platform',
  'sales engagement platform'
];

async function generateArticle(keyword) {
  console.log(`\n📝 Generating article for: "${keyword}"`);

  try {
    const response = await fetch(`${SEOBOT_API_URL}/articles/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SEOBOT_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        keyword,
        language: 'en',
        tone: 'professional',
        contentType: 'blog-post',
        includeImages: false,
        wordCount: 2000
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`SEObot API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log(`✅ Article generated: "${data.title}"`);
    return data;

  } catch (error) {
    console.error(`❌ Failed to generate article for "${keyword}":`, error.message);
    return null;
  }
}

async function saveArticle(article, keyword) {
  if (!article || !article.content) {
    console.log('⚠️  No article content to save');
    return;
  }

  const slug = article.slug || keyword.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const fileName = `${slug}.md`;
  const contentDir = path.join(__dirname, '..', 'src', 'content', 'guides');
  const filePath = path.join(contentDir, fileName);

  // Create directory if it doesn't exist
  if (!fs.existsSync(contentDir)) {
    fs.mkdirSync(contentDir, { recursive: true });
  }

  // Extract metadata from article
  const tool = extractTool(keyword, article.title);
  const useCase = extractUseCase(keyword, article.title);
  const difficulty = 'intermediate';

  // Calculate read time
  const wordCount = article.content.split(/\s+/).length;
  const timeToImplement = Math.max(5, Math.round(wordCount / 200));

  // Format dates
  const publishDate = new Date().toISOString().split('T')[0];

  // Ensure description is max 160 chars
  const description = (article.description || article.title).slice(0, 160);

  const frontmatter = `---
title: "${article.title.replace(/"/g, '\\"')}"
description: "${description.replace(/"/g, '\\"')}"
tool: "${tool}"
useCase: "${useCase}"
difficulty: "${difficulty}"
timeToImplement: ${timeToImplement}
publishDate: ${publishDate}
lastUpdated: ${publishDate}
aiGenerated: true
source: "seobot"
seobotId: "${article.id || slug}"
targetKeyword: "${keyword}"
---

${article.content}
`;

  fs.writeFileSync(filePath, frontmatter, 'utf8');
  console.log(`💾 Saved to: ${fileName}`);
}

function extractTool(keyword, title) {
  const tools = {
    'salesforce': 'salesforce',
    'hubspot': 'hubspot',
    'outreach': 'outreach',
    'gong': 'gong',
    'apollo': 'apollo',
    'salesloft': 'salesloft',
    'clearbit': 'clearbit',
    'zoominfo': 'zoominfo',
    'marketo': 'marketo',
    'pardot': 'pardot'
  };

  const text = `${keyword} ${title}`.toLowerCase();

  for (const [key, value] of Object.entries(tools)) {
    if (text.includes(key)) {
      return value;
    }
  }

  return 'salesforce'; // Default
}

function extractUseCase(keyword, title) {
  const useCases = {
    'automation': 'sales-automation',
    'prospecting': 'lead-generation',
    'enrichment': 'data-enrichment',
    'pipeline': 'pipeline-management',
    'intelligence': 'revenue-intelligence',
    'enablement': 'sales-enablement',
    'routing': 'lead-routing',
    'abm': 'account-based-marketing'
  };

  const text = `${keyword} ${title}`.toLowerCase();

  for (const [key, value] of Object.entries(useCases)) {
    if (text.includes(key)) {
      return value;
    }
  }

  return 'sales-automation'; // Default
}

async function main() {
  console.log('🚀 Starting SEObot.ai content generation for GTME JET');
  console.log(`📊 API Key: ${SEOBOT_API_KEY.slice(0, 8)}...`);
  console.log(`📝 Keywords to process: ${GTM_KEYWORDS.length}`);

  let successCount = 0;
  let failCount = 0;

  for (const keyword of GTM_KEYWORDS) {
    const article = await generateArticle(keyword);

    if (article) {
      await saveArticle(article, keyword);
      successCount++;
    } else {
      failCount++;
    }

    // Wait 2 seconds between requests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log('\n✅ Content generation complete!');
  console.log(`📊 Success: ${successCount} | Failed: ${failCount}`);
}

main().catch(console.error);
