import { decodeHtml } from './decodeHtml';

export interface Block {
  type: BlockType;
  content: string;
  language?: string;
}

export enum BlockType {
  Text = 'text',
  Code = 'code',
  List = 'list',
}

function pushTextBlocks(text: string, out: Block[]) {
  text
    .split('\n')
    .map((t) => t.trim())
    .filter(Boolean)
    .forEach((t) => out.push({ type: BlockType.Text, content: t }));
}

function normalizeCodeBlock(text: string): Block | undefined {
  const codeMatch = text.match(/<pre><code[^>]*>([\s\S]*?)<\/code><\/pre>/);

  const langMatch =
    text.match(/class="language-([^"]+)"/) ||
    text.match(/data-language="([^"]+)"/);

  if (codeMatch) {
    return {
      type: BlockType.Code,
      content: decodeHtml(codeMatch[1]),
      language: langMatch?.[1] || undefined,
    };
  }
}

// Parse content into blocks separated by line breaks and special blocks (ul, pre>code)
export const parseContentIntoBlocks = (content: string) => {
  const blocks: Block[] = [];

  const CODE_BLOCK = /<pre><code[\s\S]*?<\/code><\/pre>/g;
  const LIST_BLOCK = /<ul>[\s\S]*?<\/ul>/g;
  const blockRegex = new RegExp(
    `(${CODE_BLOCK.source}|${LIST_BLOCK.source})`,
    'g'
  );

  let lastIndex = 0;
  let match;

  function handleTextBeforeMatchedBlock() {
    const textBefore = content.slice(lastIndex, match.index).trim();
    if (textBefore) pushTextBlocks(textBefore, blocks);
  }
  function detectMatchedBlockType(blockMatch: string) {
    if (blockMatch.startsWith('<pre><code')) {
      // Code block
      const codeBlock = normalizeCodeBlock(blockMatch);
      if (codeBlock) blocks.push(codeBlock);
    } else if (blockMatch.startsWith('<ul>')) {
      // List block
      blocks.push({ type: BlockType.List, content: blockMatch });
    }
  }

  while ((match = blockRegex.exec(content)) !== null) {
    handleTextBeforeMatchedBlock();

    // get second capturing group
    const [, blockMatch] = match;
    detectMatchedBlockType(blockMatch);

    // update lastIndex to the end of the matched block
    lastIndex = match.index + match[0].length;
  }

  // Add remaining text after last block
  const remainingText = content.slice(lastIndex).trim();
  if (remainingText) pushTextBlocks(remainingText, blocks);

  return blocks;
};
