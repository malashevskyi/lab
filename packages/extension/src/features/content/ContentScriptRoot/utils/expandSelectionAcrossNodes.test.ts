import { expandSelectionAcrossNodes } from './expandSelectionAcrossNodes';

/**
 * @description Robust helper function to create a DOM structure and a Selection object.
 * It correctly finds text nodes for complex selections.
 * @param html - The inner HTML of the test container.
 * @param startSelector - CSS selector for the element containing the start node.
 * @param startTextNodeIndex - The index of the text node within the start element's childNodes.
 * @param startOffset - The start offset within the text node.
 * @param endSelector - CSS selector for the element containing the end node.
 * @param endTextNodeIndex - The index of the text node within the end element's childNodes.
 * @param endOffset - The end offset within the text node.
 * @returns The created Selection object.
 */
const createSelection = (
  html: string,
  startSelector: string,
  startTextNodeIndex: number,
  startOffset: number,
  endSelector: string,
  endTextNodeIndex: number,
  endOffset: number
): Selection => {
  document.body.innerHTML = `<div id="test-container">${html}</div>`;
  const container = document.getElementById('test-container')!;

  const startElement = container.querySelector(startSelector)!;
  const endElement = container.querySelector(endSelector)!;

  const startNode = startElement.childNodes[startTextNodeIndex];
  const endNode = endElement.childNodes[endTextNodeIndex];

  if (
    !startNode ||
    startNode.nodeType !== Node.TEXT_NODE ||
    !endNode ||
    endNode.nodeType !== Node.TEXT_NODE
  ) {
    throw new Error('Could not find start or end text node for selection.');
  }

  const range = document.createRange();
  range.setStart(startNode, startOffset);
  range.setEnd(endNode, endOffset);

  const selection = window.getSelection()!;
  selection.removeAllRanges();
  selection.addRange(range);

  return selection;
};

describe('expandSelectionAcrossNodes', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('should expand a partial word selection within a single text node', () => {
    const selection = createSelection(
      '<p>Hello beautiful world</p>',
      'p',
      0,
      8,
      'p',
      0,
      13
    ); // "utifu"
    const result = expandSelectionAcrossNodes(selection);
    expect(result.toString()).toBe('beautiful');
  });

  it('should expand a selection spanning multiple partial words', () => {
    const selection = createSelection(
      '<p>One two three four</p>',
      'p',
      0,
      2,
      'p',
      0,
      12
    ); // "e two thre"
    const result = expandSelectionAcrossNodes(selection);
    expect(result.toString()).toBe('One two three');
  });

  it('should expand selection that starts in a child node and ends in the parent node', () => {
    const html =
      '<p>Click here to find <strong>some really cool</strong> examples.</p>';

    const selection = createSelection(html, 'strong', 0, 8, 'p', 2, 5);
    const result = expandSelectionAcrossNodes(selection);
    expect(result.toString()).toBe('really cool examples');
  });

  it('should expand selection that starts in a parent and ends in a child', () => {
    const html = '<p>This is a <em>very important</em> message.</p>';
    const selection = createSelection(html, 'p', 0, 8, 'em', 0, 12);
    const result = expandSelectionAcrossNodes(selection);
    expect(result.toString()).toBe('a very important');
  });

  it('should trim punctuation from the start and end of the expansion', () => {
    const html = '<p>Please, try to select this. Thank you.</p>';
    const selection = createSelection(html, 'p', 0, 9, 'p', 0, 24);
    const result = expandSelectionAcrossNodes(selection);
    expect(result.toString()).toBe('try to select this');
  });

  it('should not change a selection that is already on perfect word boundaries', () => {
    const html = '<p>This is already perfect</p>';
    const selection = createSelection(html, 'p', 0, 8, 'p', 0, 15); // "already"
    const result = expandSelectionAcrossNodes(selection);
    expect(result.toString()).toBe('already');
  });

  it('should handle selection of the entire content', () => {
    const html = '<p>Select <strong>everything</strong> here</p>';
    const selection = createSelection(html, 'p', 0, 1, 'p', 2, 4);
    const result = expandSelectionAcrossNodes(selection);
    expect(result.toString().trim()).toBe('Select everything here');
  });

  it('should correctly expand a single word within a nested element', () => {
    const html = '<p>This is <strong>super</strong> cool.</p>';
    const selection = createSelection(html, 'strong', 0, 1, 'strong', 0, 4);
    const result = expandSelectionAcrossNodes(selection);
    expect(result.toString()).toBe('super');
  });
});
