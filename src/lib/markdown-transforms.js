// Transformations for SEObot content using unified/remark AST
import { visit } from 'unist-util-visit';

export function remarkContentTransforms() {
  return (tree, file) => {
    // First, we need to handle the raw text nodes that contain our custom syntax
    visit(tree, 'paragraph', (node, index, parent) => {
      // Check if this paragraph contains our custom syntax
      if (node.children && node.children.length > 0) {
        const firstChild = node.children[0];
        if (firstChild.type === 'text' && firstChild.value) {
          // Check for ::: @iframe pattern
          if (firstChild.value.includes('::: @iframe')) {
            const iframeMatch = firstChild.value.match(/::: @iframe (https:\/\/[^\s]+)\s*:::/);
            if (iframeMatch) {
              // Replace the paragraph with an HTML node containing the iframe
              parent.children[index] = {
                type: 'html',
                value: `<iframe src="${iframeMatch[1]}" allowfullscreen></iframe>`
              };
            }
          }
          // Check for ::: faq pattern
          else if (firstChild.value.startsWith('::: faq')) {
            // Look for the full FAQ block across multiple paragraphs
            let faqContent = '';
            let endIndex = index;

            // Collect all content until we find the closing :::
            for (let i = index; i < parent.children.length; i++) {
              const child = parent.children[i];
              if (child.type === 'paragraph' && child.children && child.children[0]) {
                const text = child.children[0].value || '';
                faqContent += text + '\n';
                if (text.includes(':::') && i > index) {
                  endIndex = i;
                  break;
                }
              } else if (child.type === 'heading' && child.depth === 3) {
                // This is the question heading
                faqContent += '### ' + child.children[0].value + '\n';
              }
            }

            // Parse the FAQ content
            const faqMatch = faqContent.match(/::: faq\s*\n### ([^\n]+)\s*\n([\s\S]*?):::/);
            if (faqMatch) {
              const [, question, answer] = faqMatch;
              // Replace all nodes from index to endIndex with a single HTML node
              parent.children.splice(index, endIndex - index + 1, {
                type: 'html',
                value: `<details>\n<summary>${question}</summary>\n\n${answer.trim()}\n</details>`
              });
            }
          }
        }
      }
    });

    // Handle CTA insertion after 3rd h2
    let headingCount = 0;
    let ctaInserted = false;

    visit(tree, 'heading', (node, index, parent) => {
      if (node.depth === 2) {
        headingCount++;

        // Insert CTA before 3rd h2 (not in FAQ sections)
        if (headingCount === 3 && !ctaInserted) {
          const headingText = node.children && node.children[0] && node.children[0].value;
          if (!headingText || !headingText.includes('FAQ')) {
            ctaInserted = true;

            // Insert the CTA HTML node before this heading
            const ctaNode = {
              type: 'html',
              value: `
<div class="cta-box">
<h3>Transform Your Revenue Infrastructure</h3>
<p>Stop wrestling with broken syncs and manual workarounds. Get production-grade GTM engineering without the $180K hire.</p>
<a href="/">Get Started with GTME JET</a>
</div>
`
            };

            parent.children.splice(index, 0, ctaNode);
            return index + 1; // Skip the CTA node we just inserted
          }
        }
      }
    });
  };
}
