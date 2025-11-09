# SEObot.ai Integration for GTME JET

## How It Works

**SEObot.ai** generates articles on their platform → You fetch them via API → Articles are saved to your site

This is different from Outrank.so which pushes articles via webhook.

## Setup

1. **Generate articles in SEObot dashboard:**
   - Go to [app.seobotai.com](https://app.seobotai.com)
   - Create articles with GTM-focused keywords
   - Publish them in the dashboard

2. **API Key is already configured:**
   - API Key: `089a7d20-81dc-4742-86de-8738634497b6`
   - Already in `.env` file

3. **Add to Vercel Environment Variables:**
   - Go to Vercel → gtm-jet-site → Settings → Environment Variables
   - Add: `SEOBOT_API_KEY` = `089a7d20-81dc-4742-86de-8738634497b6`

## Usage

### Fetch Articles Manually

```bash
cd /c/Users/jonat/revops-partner/gtm-jet-site
npm run generate
```

This will:
- Fetch all published articles from SEObot
- Convert them to markdown files in `src/content/guides/`
- Skip articles that already exist
- Auto-extract tool/useCase from article content

### Automate with GitHub Actions

The `.github/workflows/seobot-daily-fetch.yml` file runs daily at midnight UTC to automatically fetch new articles.

## Article Metadata Extraction

The script automatically extracts metadata from article content:

- **Tool:** Detected from headline/tags (salesforce, hubspot, gong, etc.)
- **Use Case:** Detected from headline/tags (sales-automation, lead-generation, etc.)
- **Difficulty:** Detected from tags or defaults to 'intermediate'
- **Read Time:** Uses SEObot's calculated reading time

## Recommended GTM Keywords for SEObot

Create articles in SEObot dashboard for these keywords:
- salesforce sales automation
- hubspot pipeline management
- outreach sales sequences
- gong conversation intelligence
- apollo prospecting automation
- salesloft cadence automation
- clearbit data enrichment
- zoominfo contact enrichment
- revenue intelligence platform
- sales engagement platform
