/**
 * HTML to Markdown Pro - Process API
 * Convert HTML to clean Markdown and vice versa
 */

// Simple HTML to Markdown converter (server-side fallback)
function htmlToMarkdown(html) {
  let md = html;

  // Remove script and style tags
  md = md.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  md = md.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');

  // Headers
  md = md.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n');
  md = md.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n');
  md = md.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n');
  md = md.replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n\n');
  md = md.replace(/<h5[^>]*>(.*?)<\/h5>/gi, '##### $1\n\n');
  md = md.replace(/<h6[^>]*>(.*?)<\/h6>/gi, '###### $1\n\n');

  // Bold and Italic
  md = md.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**');
  md = md.replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**');
  md = md.replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*');
  md = md.replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*');

  // Links
  md = md.replace(/<a[^>]+href="([^"]+)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)');

  // Images
  md = md.replace(/<img[^>]+src="([^"]+)"[^>]*alt="([^"]*)"[^>]*>/gi, '![$2]($1)');
  md = md.replace(/<img[^>]+alt="([^"]*)"[^>]*src="([^"]+)"[^>]*>/gi, '![$1]($2)');
  md = md.replace(/<img[^>]+src="([^"]+)"[^>]*>/gi, '![]($1)');

  // Code blocks
  md = md.replace(/<pre[^>]*>\s*<code[^>]*>([\s\S]*?)<\/code>\s*<\/pre>/gi, '\n```\n$1\n```\n');
  md = md.replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi, '\n```\n$1\n```\n');

  // Inline code
  md = md.replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`');

  // Blockquote
  md = md.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (match, content) => {
    return content.split('\n').map(line => '> ' + line.trim()).join('\n') + '\n\n';
  });

  // Unordered lists
  md = md.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (match, content) => {
    return content.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n') + '\n';
  });

  // Ordered lists
  md = md.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (match, content) => {
    let counter = 1;
    return content.replace(/<li[^>]*>(.*?)<\/li>/gi, () => `${counter++}. $1\n`) + '\n';
  });

  // Line breaks and paragraphs
  md = md.replace(/<br\s*\/?>/gi, '\n');
  md = md.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n');

  // Horizontal rule
  md = md.replace(/<hr\s*\/?>/gi, '\n---\n\n');

  // Tables
  md = md.replace(/<table[^>]*>([\s\S]*?)<\/table>/gi, (match, content) => {
    let rows = [];
    const rowMatches = content.match(/<tr[^>]*>([\s\S]*?)<\/tr>/gi) || [];

    rowMatches.forEach((row, rowIndex) => {
      const cells = row.match(/<t[dh][^>]*>(.*?)<\/t[dh]>/gi) || [];
      const cellContents = cells.map(cell => {
        return cell.replace(/<\/?[^>]+>/g, '').trim();
      });
      rows.push('| ' + cellContents.join(' | ') + ' |');

      // Add separator after header row
      if (rowIndex === 0) {
        rows.push('| ' + cellContents.map(() => '---').join(' | ') + ' |');
      }
    });

    return rows.join('\n') + '\n\n';
  });

  // Strikethrough
  md = md.replace(/<s[^>]*>(.*?)<\/s>/gi, '~~$1~~');
  md = md.replace(/<del[^>]*>(.*?)<\/del>/gi, '~~$1~~');

  // Superscript and subscript
  md = md.replace(/<sup[^>]*>(.*?)<\/sup>/gi, '^$1^');
  md = md.replace(/<sub[^>]*>(.*?)<\/sub>/gi, '~$1~');

  // Clean up remaining HTML tags
  md = md.replace(/<[^>]+>/g, '');

  // Decode common HTML entities
  md = md.replace(/&nbsp;/g, ' ');
  md = md.replace(/&lt;/g, '<');
  md = md.replace(/&gt;/g, '>');
  md = md.replace(/&amp;/g, '&');
  md = md.replace(/&quot;/g, '"');
  md = md.replace(/&#39;/g, "'");
  md = md.replace(/&mdash;/g, '—');
  md = md.replace(/&ndash;/g, '–');
  md = md.replace(/&hellip;/g, '...');

  // Clean up whitespace
  md = md.replace(/\n\s*\n\s*\n/g, '\n\n');
  md = md.trim();

  return md;
}

// Markdown to HTML converter
function markdownToHtml(md) {
  let html = md;

  // Escape HTML first
  html = html.replace(/&/g, '&amp;');
  html = html.replace(/</g, '&lt;');
  html = html.replace(/>/g, '&gt;');

  // Code blocks (must be before inline code)
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>');

  // Headers
  html = html.replace(/^###### (.*$)/gim, '<h6>$1</h6>');
  html = html.replace(/^##### (.*$)/gim, '<h5>$1</h5>');
  html = html.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // Bold and Italic
  html = html.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  html = html.replace(/___(.*?)___/g, '<strong><em>$1</em></strong>');
  html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');
  html = html.replace(/_(.*?)_/g, '<em>$1</em>');

  // Strikethrough
  html = html.replace(/~~(.*?)~~/g, '<del>$1</del>');

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // Images
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">');

  // Blockquotes
  html = html.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>');

  // Unordered lists
  html = html.replace(/^(\s*)[-*+] (.*$)/gim, '$1<li>$2</li>');

  // Ordered lists
  html = html.replace(/^(\s*)\d+\. (.*$)/gim, '$1<li>$2</li>');

  // Tables
  html = html.replace(/\|(.+)\|/g, (match, content) => {
    const cells = content.split('|').map(c => c.trim()).filter(c => c);
    if (cells.every(c => c.match(/^-+$/))) return ''; // Skip separator row
    return '<tr>' + cells.map(c => `<td>${c}</td>`).join('') + '</tr>';
  });

  // Horizontal rule
  html = html.replace(/^---+$/gim, '<hr>');

  // Line breaks
  html = html.replace(/\n/g, '<br>');

  // Wrap lists in ul/ol (simplified)
  html = html.replace(/(<li>.*<\/li>)/g, '<ul>$1</ul>');

  return html;
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-License-Key');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { html, markdown, mode = 'html-to-markdown' } = req.body || {};

    if (mode === 'html-to-markdown') {
      if (!html || typeof html !== 'string') {
        return res.status(400).json({
          error: 'Missing or invalid HTML input',
          details: 'Please provide HTML content as a string'
        });
      }

      const result = htmlToMarkdown(html);

      return res.status(200).json({
        success: true,
        mode: 'html-to-markdown',
        result,
        stats: {
          inputLength: html.length,
          outputLength: result.length,
          conversionRatio: Math.round((result.length / html.length) * 100)
        }
      });
    }

    if (mode === 'markdown-to-html') {
      if (!markdown || typeof markdown !== 'string') {
        return res.status(400).json({
          error: 'Missing or invalid Markdown input',
          details: 'Please provide Markdown content as a string'
        });
      }

      const result = markdownToHtml(markdown);

      return res.status(200).json({
        success: true,
        mode: 'markdown-to-html',
        result,
        stats: {
          inputLength: markdown.length,
          outputLength: result.length,
          conversionRatio: Math.round((result.length / markdown.length) * 100)
        }
      });
    }

    return res.status(400).json({
      error: 'Invalid mode',
      details: 'Mode must be "html-to-markdown" or "markdown-to-html"'
    });

  } catch (error) {
    console.error('Conversion error:', error);
    return res.status(500).json({
      error: 'Conversion failed',
      details: error.message
    });
  }
};
