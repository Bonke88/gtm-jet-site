/**
 * Outrank.so API Client
 * Documentation: https://outrank.so/docs/api
 */

import config from '../config.js';

/**
 * Fetch articles from Outrank.so
 * @returns {Promise<Array>} Array of article objects
 */
export async function fetchOutrankContent() {
  const { apiKey, workflow, qualityScore } = config.outrank;

  if (!apiKey) {
    console.warn('Outrank API key not configured. Skipping Outrank content fetch.');
    return [];
  }

  try {
    // TODO: Replace with actual Outrank API endpoint
    const response = await fetch(`https://api.outrank.so/v1/content`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      params: {
        workflow,
        min_quality: qualityScore
      }
    });

    if (!response.ok) {
      throw new Error(`Outrank API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Transform Outrank response to our format
    return data.articles.map(article => ({
      title: article.title,
      content: article.markdown_content,
      metadata: {
        keyword: article.primary_keyword,
        wordCount: article.word_count,
        qualityScore: article.quality_score,
        optimizationScore: article.optimization_score
      },
      source: 'outrank',
      cost: calculateOutrankCost(article.word_count),
      publishedAt: new Date(article.created_at)
    }));

  } catch (error) {
    console.error('Error fetching from Outrank:', error);
    return [];
  }
}

/**
 * Request new article generation from Outrank
 * @param {string} keyword - Target keyword
 * @param {object} options - Additional options
 * @returns {Promise<object>} Generated article
 */
export async function generateOutrankArticle(keyword, options = {}) {
  const { apiKey, workflow, settings, autoOptimize } = config.outrank;

  if (!apiKey) {
    throw new Error('Outrank API key not configured');
  }

  try {
    const response = await fetch(`https://api.outrank.so/v1/content/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        primary_keyword: keyword,
        workflow,
        depth: settings.depth,
        research_level: settings.researchLevel,
        auto_optimize: autoOptimize,
        ...options
      })
    });

    if (!response.ok) {
      throw new Error(`Outrank generation error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    return {
      title: data.title,
      content: data.markdown_content,
      metadata: {
        keyword: data.primary_keyword,
        wordCount: data.word_count,
        qualityScore: data.quality_score,
        optimizationScore: data.optimization_score
      },
      source: 'outrank',
      cost: calculateOutrankCost(data.word_count),
      publishedAt: new Date()
    };

  } catch (error) {
    console.error('Error generating article with Outrank:', error);
    throw error;
  }
}

/**
 * Calculate Outrank cost based on word count
 * Based on typical pricing of $15-25 per 2000-word article
 */
function calculateOutrankCost(wordCount) {
  const baseCost = 20; // $20 for 2000 words
  const baseWords = 2000;
  return (wordCount / baseWords) * baseCost;
}
