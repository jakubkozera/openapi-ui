/**
 * Markdown Renderer Utility
 * Converts Markdown text to HTML with proper sanitization
 */

class MarkdownRenderer {
  constructor() {
    // Initialize the renderer
  }
  /**
   * Convert Markdown to HTML
   * @param {string} markdownText - The markdown text to convert
   * @returns {string} - HTML string
   */
  render(markdownText) {
    if (!markdownText || typeof markdownText !== "string") {
      return "";
    }

    let html = markdownText;

    // Normalize line endings (convert \r\n to \n)
    html = html.replace(/\r\n/g, "\n");

    // Convert headers
    html = html.replace(
      /^### (.*$)/gm,
      '<h3 class="text-lg font-semibold text-gray-800 mt-4 mb-2">$1</h3>'
    );
    html = html.replace(
      /^## (.*$)/gm,
      '<h2 class="text-xl font-semibold text-gray-800 mt-4 mb-3">$1</h2>'
    );
    html = html.replace(
      /^# (.*$)/gm,
      '<h1 class="text-2xl font-bold text-gray-800 mt-4 mb-3">$1</h1>'
    );

    // Convert code blocks FIRST (before any other backtick processing)
    html = html.replace(/```(\w+)?\s*([\s\S]*?)```/g, (match, lang, code) => {
      const language = lang ? ` data-language="${lang}"` : "";
      return `<pre class="bg-gray-50 border border-gray-200 rounded-md p-3 my-3 overflow-x-auto"><code class="text-sm font-mono text-gray-800"${language}>${this.escapeHtml(
        code.trim()
      )}</code></pre>`;
    });

    // Convert inline code AFTER code blocks
    html = html.replace(
      /`([^`]+)`/g,
      '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono text-gray-800">$1</code>'
    );

    // Convert bold text
    html = html.replace(
      /\*\*(.*?)\*\*/g,
      '<strong class="font-semibold">$1</strong>'
    );
    html = html.replace(
      /__(.*?)__/g,
      '<strong class="font-semibold">$1</strong>'
    );

    // Convert italic text
    html = html.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');
    html = html.replace(/_(.*?)_/g, '<em class="italic">$1</em>');

    // Convert links
    html = html.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" class="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">$1</a>'
    );

    // Convert unordered lists
    html = html.replace(
      /^[\s]*[-\*\+][\s]+(.*$)/gm,
      '<li class="ml-4 list-disc">$1</li>'
    );
    html = html.replace(
      /(<li[^>]*>.*<\/li>)/s,
      '<ul class="my-2 space-y-1">$1</ul>'
    );

    // Convert ordered lists
    html = html.replace(
      /^[\s]*\d+\.[\s]+(.*$)/gm,
      '<li class="ml-4 list-decimal">$1</li>'
    );
    html = html.replace(
      /(<li[^>]*class="[^"]*list-decimal[^"]*"[^>]*>.*<\/li>)/s,
      '<ol class="my-2 space-y-1">$1</ol>'
    );

    // Convert line breaks
    html = html.replace(/\n\n/g, '</p><p class="text-gray-700 mb-4">');

    // Convert blockquotes
    html = html.replace(
      /^> (.*$)/gm,
      '<blockquote class="border-l-4 border-gray-300 pl-4 italic text-gray-600 my-2">$1</blockquote>'
    );

    // Convert horizontal rules
    html = html.replace(/^---$/gm, '<hr class="my-4 border-gray-300">');

    // Wrap in paragraph if not already wrapped
    if (html && !html.trim().startsWith("<")) {
      html = `<p class="text-gray-700 mb-4">${html}</p>`;
    }

    return html;
  }

  /**
   * Escape HTML characters to prevent XSS
   * @param {string} text - Text to escape
   * @returns {string} - Escaped text
   */
  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Sanitize HTML content
   * @param {string} html - HTML to sanitize
   * @returns {string} - Sanitized HTML
   */
  sanitize(html) {
    // Create a temporary element to parse HTML
    const temp = document.createElement("div");
    temp.innerHTML = html;

    // Remove script tags and event handlers
    const scripts = temp.querySelectorAll("script");
    scripts.forEach((script) => script.remove());

    // Remove potentially dangerous attributes
    const allElements = temp.querySelectorAll("*");
    allElements.forEach((element) => {
      // Remove event handlers
      Array.from(element.attributes).forEach((attr) => {
        if (attr.name.startsWith("on")) {
          element.removeAttribute(attr.name);
        }
      });

      // Remove javascript: links
      if (element.href && element.href.startsWith("javascript:")) {
        element.removeAttribute("href");
      }
    });

    return temp.innerHTML;
  }

  /**
   * Render and sanitize markdown content
   * @param {string} markdownText - The markdown text to convert
   * @returns {string} - Safe HTML string
   */
  renderSafe(markdownText) {
    const html = this.render(markdownText);
    return this.sanitize(html);
  }
}

// Create a global instance
window.markdownRenderer = new MarkdownRenderer();

// Export for module usage
if (typeof module !== "undefined" && module.exports) {
  module.exports = MarkdownRenderer;
}
