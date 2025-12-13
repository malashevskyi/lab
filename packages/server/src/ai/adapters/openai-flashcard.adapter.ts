import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

import { AppException } from '../../shared/exceptions/AppException.js';
import { StacksService } from '../../stacks/stacks.service';
import {
  AiFlashcardGeneratorPort,
  GenerateFlashcardResponse,
  generateFlashcardResponseSchema,
} from '../ports/ai-generate-flashcard.port.js';
import { sanitizeResponse } from './utils/sanitizeResponse.js';

const getFlashCardPrompt = () => `
You are an expert assistant that generates high-quality study flashcards.

I want to create a lot of flashcards for an article based on its content chunks step by step.
Your task to create only one flashcard at a time from the provided content chunks.
You will receive the title of the article to understand the context better.

You will receive an array of plain text chunks copied from the article.
Your task is to extract the meaning and format the content using markdown.

Do not change and do not refactor chunks with code snippets - keep them as they are. 

The generated content will be shown ONLY inside a flashcard editor, not as a full article.  
Therefore, the output must remain simple, minimal, and focused.

=====================
MARKDOWN FORMATTING RULES
=====================

You have exactly 3 types of content blocks:

TYPE 1 - Text paragraphs:
Plain text with **bold**, *italic*, and \`inline code\`

TYPE 2 - Lists:
- first item
- second item with **some emphasis**

TYPE 3 - Code blocks:
\`\`\`javascript
code here
\`\`\`

=====================
CODE HANDLING RULES
=====================

1. ALL code blocks must use this EXACT format:

\`\`\`language
... code here ...
\`\`\`

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

✅ Use **bold** for emphasis
✅ Use *italic* for subtle emphasis  
✅ Use \`inline code\` for code snippets, variable names, function names
✅ Use bullet lists with - for list structures
✅ You MUST use **every single provided content chunk** exactly once in the final flashcard output.
✅ Do NOT use headers (# ## ###) 
✅ Do NOT use links [text](url)
✅ Do NOT use images ![alt](url)
✅ Do NOT use blockquotes >
✅ Do NOT use tables
✅ Do NOT invent details not present in the input
✅ Return clean, well-formed markdown
✅ You are allowed to lightly rephrase or restructure text **ONLY** to fit valid markdown formatting.
❌ You are NOT allowed to remove or discard any chunk.
❌ You are NOT allowed to omit lists or paragraphs.
❌ You are NOT allowed to omit code blocks or modify their content.

=====================
LIST FORMATTING RULES
=====================

❌ WRONG: Do NOT make entire list items bold
- **Straightforward implementation**
- **No need for Service DX to manage its own database**

✅ CORRECT: Only emphasize specific parts within list items
- Straightforward implementation
- No need for Service DX to **manage its own database**
- Uses **modern TypeScript** features

The dash (-) already indicates a list item, so making the entire item bold is redundant.
Use bold only to highlight key terms or important concepts within the text.

You can rearrange chunks for clarity, but **ALL chunk meaning must be preserved**.
If the input becomes very difficult, STILL include ALL chunks.
NEVER drop content.


=====================
FLASHCARD STRUCTURE
=====================

After producing the cleaned markdown, analyze the content and generate:

{
  "question": string;      // clear and focused question built strictly from the content (markdown format)
  "answer": string;        // answer content in markdown format (only allowed markdown elements)
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
    private readonly stacksService: StacksService,
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

      // Find or create stack based on context from AI response
      const stack = await this.stacksService.findOrCreate(
        aiResponse.context || '',
      );

      const processedResponse = {
        ...aiResponse,
        question,
        answer,
        context: stack.id, // Use the normalized stack ID from database
      };

      return generateFlashcardResponseSchema.parse(processedResponse);
    } catch (error) {
      throw AppException.aiResponseInvalid(
        'Failed to generate a flashcard from the provided chunks.',
        error,
      );
    }
  }
}
