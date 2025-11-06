import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import DOMPurify from 'isomorphic-dompurify';

import { ErrorService } from '../../errors/errors.service.js';
import { AppErrorCode } from '../../shared/exceptions/AppErrorCode.js';
import {
  AiFlashcardGeneratorPort,
  GenerateFlashcardResponse,
  generateFlashcardResponseSchema,
} from '../ports/ai-generate-flashcard.port.js';
import { processHtmlContent } from './utils/processHtmlContent.js';
import { sanitizeResponse } from './utils/sanitizeResponse.js';

const getFlashCardPrompt = () => `
You are an expert assistant that generates high-quality study flashcards.

I want to create a lot of flashcards for an article based on its content chunks step by step.
Your task to create only one flashcard at a time from the provided content chunks.
You will receive the title of the article to understand the context better.

You will receive an array of plain text chunks copied from the article.
Your task is to extract the meaning and format the content using valid HTML.

Do not change and do not refactor chunks with code snippets - keep them as they are. 

The generated HTML will be shown ONLY inside a flashcard editor, not as a full article.  
Therefore, the output must remain simple, minimal, and focused.

=====================
HTML FORMATTING RULES
=====================

You have exactly 3 types of content blocks:

TYPE 1 - Text paragraphs:
<p>text with <strong>bold</strong>, <em>italic</em>, <code>inline code</code></p>

TYPE 2 - Lists:
<ul>
<li>first item</li>
<li>second item with <strong>some emphasis</strong></li>
</ul>

CRITICAL: In lists, do NOT wrap entire <li> content in formatting tags.
✅ Correct: <li>Item with <strong>emphasis</strong> word</li>
❌ Wrong: <li><strong>Entire item content</strong></li>

TYPE 3 - Code blocks:
<pre><code class="language-XXX" data-language="XXX">>code here</code></pre>

CRITICAL RULE: <p> tags can ONLY contain inline formatting tags.
<p> tags CANNOT contain code blocks or lists!

Allowed inside <p>: <strong>, <em>, <i>, <code>, <u>
Allowed block structures: <p>, <ul>, <li>, <pre>, <code>

FORBIDDEN inside <p>:
- <pre><code> blocks
- <ul><li> lists
- Other <p> tags

=====================
CODE HANDLING RULES
=====================

1. ALL code blocks must use this EXACT format:

<pre><code class="language-XXX" data-language="XXX">
... code here ...
</code></pre>

2. Detect the language automatically based on the provided chunks.

3. When ambiguous, prefer:
   - "typescript" over "javascript"
   - "javascript" over "text"

4. Normalize malformed code:
   - remove unnecessary div/span wrappers
   - combine related fragments
   - preserve indentation and formatting

=====================
TEXT PROCESSING RULES
=====================

- Automatically detect and format inline code with <code> tags (only inside <p> tags)
- Identify emphasis and format with <strong> or <em> tags (only inside <p> tags)
- Convert any list structures to <ul><li> format (as separate blocks)
- Use HTML tags (<strong>, <em>, <code>) instead of Markdown syntax
- Do NOT invent details not present in the input
- Wrap plain text content in <p> tags with inline formatting only
- Return valid, well-formed HTML


=====================
FLASHCARD STRUCTURE
=====================

After producing the cleaned HTML, analyze the content and generate:

{
  "question": string;      // clear and focused question built strictly from the content
  "answer": string;        // Quill-compatible sanitized HTML (only allowed tags)
  "context": string;       // 1-2 words identifying unique context (e.g., "React", "Node.js", "PostgreSQL", "TypeScript")
  "tags": string[];        // lowercase topic labels
  "level": "junior" | "middle" | "senior"; // estimate knowledge level required
  "contexts": ("interview" | "general-knowledge" | "best-practice" | "deep-dive")[]; // where is this information useful?
}

Respond ONLY with valid JSON that exactly matches this schema.  
NO explanations. NO additional text.  
`;

@Injectable()
export class OpenAiFlashcardAdapter implements AiFlashcardGeneratorPort {
  private readonly openai: OpenAI;

  constructor(
    private readonly configService: ConfigService,
    private readonly errorService: ErrorService,
  ) {
    const apiKey = this.configService.getOrThrow<string>('OPENAI_API_KEY');
    const projectId = this.configService.get<string>('OPENAI_PROJECT_ID');
    this.openai = new OpenAI({ apiKey, project: projectId || undefined });
  }

  async generateFlashcardFromChunks(
    title: string,
    chunks: string[],
  ): Promise<GenerateFlashcardResponse> {
    try {
      const openAiModel = this.configService.getOrThrow<string>('OPENAI_MODEL');
      const userPrompt = `
      Article title: ${title}
      Extracted content:\n${chunks
        .map((chunk, index) => `Chunk ${index + 1}: ${chunk}`)
        .join('\n')}`;

      const completion = await this.openai.chat.completions.create({
        model: openAiModel,
        messages: [
          { role: 'system', content: getFlashCardPrompt() },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
      });

      const responseContent = completion.choices[0]?.message.content;
      if (!responseContent) {
        throw new Error('OpenAI returned an empty response content.');
      }

      const aiResponse: GenerateFlashcardResponse = JSON.parse(responseContent);

      const { answer, question } = sanitizeResponse(
        aiResponse.question,
        aiResponse.answer,
      );

      /**
       * Process HTML to remove p wrappers and format for frontend
       * to decrease complexity for flashcard editing
       * As it is hard for AI to generate HTML without unnecessary wrappers, we clean it manually here
       */
      const processedResponse = {
        ...aiResponse,
        question: processHtmlContent(question),
        answer: processHtmlContent(answer),
        context: DOMPurify.sanitize(aiResponse.context || '', {
          ALLOWED_TAGS: [],
        }), // Only text, no HTML
      };

      return generateFlashcardResponseSchema.parse(processedResponse);
    } catch (error) {
      this.errorService.handle(
        AppErrorCode.AI_RESPONSE_INVALID,
        'Failed to generate a flashcard from the provided chunks.',
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
