import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { BlogClient } from 'seobot';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SEOBOT_API_KEY = process.env.SEOBOT_API_KEY || '089a7d20-81dc-4742-86de-8738634497b6';

async function fetchAndSaveArticles() {
  console.log('🚀 Starting SEObot.ai content fetch for GTME JET');
  console.log(`📊 API Key: ${SEOBOT_API_KEY.slice(0, 8)}...`);

  try {
    // Initialize SEObot client
    const client = new BlogClient(SEOBOT_API_KEY);

    // Fetch all articles (page 0, limit 50)
    console.log('\n📥 Fetching articles from SEObot...');
    const response = await client.getArticles(0, 50);

    // Handle response structure - might be { articles: [...] } or just [...]
    const articles = Array.isArray(response) ? response : (response?.articles || response?.data || []);

    if (!articles || articles.length === 0) {
      console.log('⚠️  No articles found. Make sure articles are generated in seobotai.com dashboard.');
      console.log('📝 To generate articles: https://app.seobotai.com');
      return;
    }

    console.log(`✅ Found ${articles.length} articles`);

    const contentDir = path.join(__dirname, '..', 'src', 'content', 'guides');

    // Create directory if it doesn't exist
    if (!fs.existsSync(contentDir)) {
      fs.mkdirSync(contentDir, { recursive: true });
    }

    let savedCount = 0;
    let skippedCount = 0;

    for (const article of articles) {
      const fileName = `${article.slug}.md`;
      const filePath = path.join(contentDir, fileName);

      // Skip if file already exists
      if (fs.existsSync(filePath)) {
        console.log(`⏭️  Already exists: "${article.headline}"`);
        skippedCount++;
        continue;
      }

      // Fetch full article content
      console.log(`📥 Fetching full content for: "${article.headline}"`);
      const fullArticle = await client.getArticle(article.slug);

      if (!fullArticle || (!fullArticle.markdown && !fullArticle.html)) {
        console.log(`⚠️  No content available for: "${article.headline}"`);
        skippedCount++;
        continue;
      }

      // Extract metadata
      const tool = extractTool(article.headline, article.tags);
      const useCase = extractUseCase(article.headline, article.tags);
      const difficulty = extractDifficulty(article.tags);

      // Format dates
      const publishDate = article.publishedAt
        ? new Date(article.publishedAt).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];

      const lastUpdated = article.updatedAt
        ? new Date(article.updatedAt).toISOString().split('T')[0]
        : publishDate;

      // Ensure description is max 160 chars
      const description = (article.metaDescription || article.headline).slice(0, 160);

      // Transform the markdown content
      let content = fullArticle.markdown || fullArticle.html;

      // Transform ::: @iframe URL ::: to proper iframe HTML
      content = content.replace(
        /::: @iframe (https:\/\/[^\s]+)\s*:::/g,
        '<iframe src="$1" allowfullscreen></iframe>'
      );

      // Transform ::: faq blocks to <details> HTML
      content = content.replace(
        /::: faq\s*\n### ([^\n]+)\s*\n([\s\S]*?):::/g,
        (match, question, answer) => {
          const cleanAnswer = answer.trim();
          return `<details>\n<summary>${question}</summary>\n\n${cleanAnswer}\n</details>\n`;
        }
      );

      // Add mid-article CTA after the 3rd ## heading
      let headingCount = 0;
      let ctaInserted = false;

      content = content.replace(/^## ([^\n]+)/gm, (match, heading) => {
        headingCount++;

        // Insert CTA before 3rd section
        if (headingCount === 3 && !ctaInserted && !heading.includes('FAQ')) {
          ctaInserted = true;
          const cta = `\n<div class="cta-box">\n<h3>Transform Your Revenue Infrastructure</h3>\n<p>Stop wrestling with broken syncs and manual workarounds. Get production-grade GTM engineering without the $180K hire.</p>\n<a href="/">Get Started with GTME JET</a>\n</div>\n\n`;
          return cta + match;
        }

        return match;
      });

      // Create frontmatter
      const frontmatter = `---
title: "${article.headline.replace(/"/g, '\\"')}"
description: "${description.replace(/"/g, '\\"')}"
tool: "${tool}"
useCase: "${useCase}"
difficulty: "${difficulty}"
timeToImplement: ${article.readingTime || 10}
publishDate: ${publishDate}
lastUpdated: ${lastUpdated}
aiGenerated: true
source: "seobot"
seobotId: "${article.id}"
targetKeyword: "${article.metaKeywords || article.headline}"
---

${content}
`;

      fs.writeFileSync(filePath, frontmatter, 'utf8');
      console.log(`💾 Saved: "${article.headline}" → ${fileName}`);
      savedCount++;
    }

    console.log('\n✅ Content fetch complete!');
    console.log(`📊 Saved: ${savedCount} | Skipped: ${skippedCount} | Total: ${articles.length}`);

  } catch (error) {
    console.error('❌ Error fetching articles:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
}

function extractTool(headline, tags = []) {
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
    'pardot': 'pardot',
    'clay': 'clay',
    'zapier': 'zapier',
    'make': 'make'
  };

  const text = `${headline} ${tags.map(t => t.title || '').join(' ')}`.toLowerCase();

  for (const [key, value] of Object.entries(tools)) {
    if (text.includes(key)) {
      return value;
    }
  }

  return 'salesforce'; // Default
}

function extractUseCase(headline, tags = []) {
  const useCases = {
    'automation': 'sales-automation',
    'prospecting': 'lead-generation',
    'enrichment': 'data-enrichment',
    'pipeline': 'pipeline-management',
    'intelligence': 'revenue-intelligence',
    'enablement': 'sales-enablement',
    'routing': 'lead-routing',
    'abm': 'account-based-marketing',
    'generation': 'lead-generation'
  };

  const text = `${headline} ${tags.map(t => t.title || '').join(' ')}`.toLowerCase();

  for (const [key, value] of Object.entries(useCases)) {
    if (text.includes(key)) {
      return value;
    }
  }

  return 'sales-automation'; // Default
}

function extractDifficulty(tags = []) {
  const text = tags.map(t => t.title || '').join(' ').toLowerCase();

  if (text.includes('beginner')) return 'beginner';
  if (text.includes('advanced')) return 'advanced';

  return 'intermediate'; // Default
}

fetchAndSaveArticles().catch(console.error);
