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
  const codeMatch = text.match(/```(\w*)\n([\s\S]*?)\n```/);

  if (codeMatch) {
    const [, language, content] = codeMatch;
    return {
      type: BlockType.Code,
      content,
      language: language || undefined,
    };
  }
}

// Parse markdown content into blocks separated by line breaks and special blocks (lists, code blocks)
export const parseContentIntoBlocks = (content: string) => {
  const blocks: Block[] = [];

  const CODE_BLOCK = /```\w*\n[\s\S]*?\n```/g;
  const LIST_BLOCK = /((?:^- .+$\n?)+)/gm;
  const blockRegex = new RegExp(
    `(${CODE_BLOCK.source}|${LIST_BLOCK.source})`,
    'gm'
  );

  let lastIndex = 0;
  let match;

  function handleTextBeforeMatchedBlock() {
    const textBefore = content.slice(lastIndex, match.index).trim();
    if (textBefore) pushTextBlocks(textBefore, blocks);
  }
  function detectMatchedBlockType(blockMatch: string) {
    if (blockMatch.startsWith('```')) {
      // Code block
      const codeBlock = normalizeCodeBlock(blockMatch);
      if (codeBlock) blocks.push(codeBlock);
    } else if (blockMatch.trim().startsWith('- ')) {
      // List block
      blocks.push({ type: BlockType.List, content: blockMatch });
    }
  }

  while ((match = blockRegex.exec(content)) !== null) {
    handleTextBeforeMatchedBlock();

    // get first capturing group
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
