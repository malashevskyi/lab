import { JSDOM } from 'jsdom';

/**
 * Process HTML to remove paragraph wrappers and format for frontend
 * Keep ul and pre>code blocks as is, remove p tags from text content
 * Clean up list items from unnecessary wrapper tags
 */
export const processHtmlContent = (html: string): string => {
  const dom = new JSDOM(html);
  const document = dom.window.document;
  const body = document.body;

  const processedNodes: string[] = [];

  // Helper function to clean list items
  const cleanListItems = (ulElement: Element): void => {
    const listItems = ulElement.querySelectorAll('li');
    listItems.forEach((li) => {
      // Check if entire li content is wrapped in a single formatting tag
      const children = Array.from(li.childNodes);
      if (
        children.length === 1 &&
        children[0].nodeType === dom.window.Node.ELEMENT_NODE
      ) {
        const singleChild = children[0] as Element;
        // If li contains only one formatting element (strong, em, etc) with no other content
        if (['STRONG', 'EM', 'I', 'B'].includes(singleChild.tagName)) {
          // Move the content out and remove the wrapper
          li.innerHTML = singleChild.innerHTML;
        }
      }
    });
  };

  Array.from(body.childNodes).forEach((node) => {
    if (node.nodeType === dom.window.Node.ELEMENT_NODE) {
      const element = node as Element;

      if (element.tagName === 'UL') {
        // Clean list items before processing
        cleanListItems(element);
        processedNodes.push(element.outerHTML);
      } else if (element.tagName === 'PRE') {
        // For code blocks, we need to preserve original content without HTML entities
        // Get the original HTML but preserve the structure
        processedNodes.push(element.outerHTML);
      } else if (element.tagName === 'P') {
        // Remove p wrapper, keep inner content with inline formatting
        processedNodes.push(element.innerHTML);
      } else {
        // Other elements - keep as is
        processedNodes.push(element.outerHTML);
      }
    } else if (node.nodeType === dom.window.Node.TEXT_NODE) {
      // Plain text - add as is
      const text = node.textContent?.trim();
      if (text) {
        processedNodes.push(text);
      }
    }
  });

  return processedNodes.join('\n');
};
