export function slugify(text = '') {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function estimateReadTime(content = '') {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}

export function formatBlogDate(isoDate) {
  if (!isoDate) return '';
  return new Date(isoDate).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function parseContentBlocks(content = '') {
  return content
    .split('\n\n')
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      if (block.startsWith('### ')) {
        return { type: 'h3', text: block.slice(4).trim() };
      }
      if (block.startsWith('## ')) {
        return { type: 'h2', text: block.slice(3).trim() };
      }
      if (block.split('\n').every((line) => line.startsWith('- '))) {
        return {
          type: 'ul',
          items: block.split('\n').map((line) => line.slice(2).trim()),
        };
      }
      return { type: 'p', text: block };
    });
}
