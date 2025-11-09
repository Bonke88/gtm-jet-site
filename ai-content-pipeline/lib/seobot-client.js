/**
 * SEObot.ai API Client
 * Documentation: https://seobotai.com/docs/api
 */

import config from '../config.js';

/**
 * Fetch articles from SEObot.ai
 * @returns {Promise<Array>} Array of article objects
 */
export async function fetchSeobotContent() {
  const { apiKey, projectId, contentType, settings } = config.seobot;

  if (!apiKey) {
    console.warn('SEObot API key not configured. Skipping SEObot content fetch.');
    return [];
  }

  try {
    // TODO: Replace with actual SEObot API endpoint
    const response = await fetch(`https://api.seobotai.com/v1/projects/${projectId}/articles`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`SEObot API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Transform SEObot response to our format
    return data.articles.map(article => ({
      title: article.title,
      content: article.body_markdown || article.body_html,
      metadata: {
        keyword: article.target_keyword,
        wordCount: article.word_count,
        readabilityScore: article.readability_score,
        seoScore: article.seo_score
      },
      source: 'seobot',
      cost: calculateSeobotCost(article.word_count),
      publishedAt: new Date(article.created_at)
    }));

  } catch (error) {
    console.error('Error fetching from SEObot:', error);
    return [];
  }
}

/**
 * Request new article generation from SEObot
 * @param {string} keyword - Target keyword
 * @param {object} options - Additional options
 * @returns {Promise<object>} Generated article
 */
export async function generateSeobotArticle(keyword, options = {}) {
  const { apiKey, projectId, settings } = config.seobot;

  if (!apiKey) {
    throw new Error('SEObot API key not configured');
  }

  try {
    const response = await fetch(`https://api.seobotai.com/v1/projects/${projectId}/articles`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        target_keyword: keyword,
        content_type: config.seobot.contentType,
        word_count: settings.wordCount.max,
        tone: settings.tone,
        include_faq: settings.includeFAQ,
        include_toc: settings.includeTableOfContents,
        ...options
      })
    });

    if (!response.ok) {
      throw new Error(`SEObot generation error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    return {
      title: data.title,
      content: data.body_markdown || data.body_html,
      metadata: {
        keyword: data.target_keyword,
        wordCount: data.word_count,
        readabilityScore: data.readability_score,
        seoScore: data.seo_score
      },
      source: 'seobot',
      cost: calculateSeobotCost(data.word_count),
      publishedAt: new Date()
    };

  } catch (error) {
    console.error('Error generating article with SEObot:', error);
    throw error;
  }
}

/**
 * Calculate SEObot cost based on word count
 * Based on typical pricing of $20-30 per 2000-word article
 */
function calculateSeobotCost(wordCount) {
  const baseCost = 25; // $25 for 2000 words
  const baseWords = 2000;
  return (wordCount / baseWords) * baseCost;
}
