import { doRangesIntersect } from './doRangesIntersect';

const createRangeInContainer = (
  container: HTMLElement,
  startSelector: string,
  startTextNodeIndex: number,
  startOffset: number,
  endSelector: string,
  endTextNodeIndex: number,
  endOffset: number
): Range => {
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
    throw new Error(
      `Could not find text node for range. Start: ${startSelector}[${startTextNodeIndex}], End: ${endSelector}[${endTextNodeIndex}]`
    );
  }

  const range = document.createRange();
  range.setStart(startNode, startOffset);
  range.setEnd(endNode, endOffset);

  return range;
};

describe('doRangesIntersect', () => {
  let testContainer: HTMLElement;

  beforeEach(() => {
    testContainer = document.createElement('div');
    document.body.appendChild(testContainer);
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('should return true when a new selection is made entirely inside an existing complex selection', () => {
    testContainer.innerHTML =
      '<p>We <strong>needed</strong> to find a good naming convention.</p>';

    const existingRange = createRangeInContainer(
      testContainer,
      'p',
      0,
      0,
      'p',
      2,
      8
    );

    expect(existingRange.toString()).toBe('We needed to find');

    const newRange = createRangeInContainer(
      testContainer,
      'strong',
      0,
      0,
      'strong',
      0,
      6
    );
    expect(newRange.toString()).toBe('needed');

    const intersects = doRangesIntersect(existingRange, newRange);
    expect(intersects).toBe(true);
  });

  it('should return true when a new selection partially overlaps an existing complex selection', () => {
    testContainer.innerHTML =
      '<p>We <strong>needed</strong> to find a good naming convention.</p>';

    const existingRange = createRangeInContainer(
      testContainer,
      'p',
      0,
      0,
      'p',
      2,
      8
    );
    expect(existingRange.toString()).toBe('We needed to find');

    const newRange = createRangeInContainer(
      testContainer,
      'p',
      2,
      4,
      'p',
      2,
      15
    );
    expect(newRange.toString()).toBe('find a good');

    const intersects = doRangesIntersect(existingRange, newRange);
    expect(intersects).toBe(true);
  });

  it('should return false for two distinct, non-overlapping complex selections', () => {
    testContainer.innerHTML =
      '<p>We <strong>needed</strong> to find a <em>good</em> naming convention.</p>';

    const existingRange = createRangeInContainer(
      testContainer,
      'p',
      0,
      0,
      'strong',
      0,
      6
    );
    expect(existingRange.toString()).toBe('We needed');

    const newRange = createRangeInContainer(
      testContainer,
      'em',
      0,
      0,
      'p',
      4,
      7
    );
    expect(newRange.toString()).toBe('good naming');

    const intersects = doRangesIntersect(existingRange, newRange);
    expect(intersects).toBe(false);
  });
});
