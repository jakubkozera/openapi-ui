import { marked } from 'marked';
import DOMPurify from 'dompurify';

// Configure marked
marked.setOptions({
  breaks: true,
  gfm: true,
});

/**
 * Render markdown to safe HTML
 */
export function renderMarkdown(text: string): string {
  if (!text) return '';
  
  try {
    const html = marked.parse(text, { async: false }) as string;
    return DOMPurify.sanitize(html);
  } catch {
    return DOMPurify.sanitize(text);
  }
}

/**
 * Escape HTML special characters
 */
export function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}
