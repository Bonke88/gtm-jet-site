// Simple text-based transformations for SEObot content

export function remarkContentTransforms() {
  return (tree, file) => {
    const content = file.value || '';
    let transformed = content;

    // Transform ::: @iframe URL ::: to proper iframe HTML
    transformed = transformed.replace(
      /::: @iframe (https:\/\/[^\s]+)\s*:::/g,
      '<iframe src="$1" allowfullscreen></iframe>'
    );

    // Transform ::: faq blocks to <details> HTML
    transformed = transformed.replace(
      /::: faq\s*\n### ([^\n]+)\s*\n([\s\S]*?):::/g,
      (match, question, answer) => {
        // Clean up the answer content
        const cleanAnswer = answer.trim();
        return `<details>\n<summary>${question}</summary>\n${cleanAnswer}\n</details>`;
      }
    );

    // Add mid-article CTA after the second ## heading
    let headingCount = 0;
    let ctaInserted = false;

    transformed = transformed.replace(/^## ([^\n]+)/gm, (match, heading) => {
      headingCount++;

      // Insert CTA after 3rd section (before section 3 heading)
      if (headingCount === 3 && !ctaInserted && !heading.includes('FAQ')) {
        ctaInserted = true;
        const cta = `
<div class="cta-box">
<h3>Transform Your Revenue Infrastructure</h3>
<p>Stop wrestling with broken syncs and manual workarounds. Get production-grade GTM engineering without the $180K hire.</p>
<a href="/">Get Started with GTME JET</a>
</div>

`;
        return cta + match;
      }

      return match;
    });

    file.value = transformed;
  };
}
