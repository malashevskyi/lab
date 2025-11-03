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

const getFlashCardPrompt = () => `
You are an expert assistant that generates high-quality study flashcards.

I want to create a lot of flashcards for an article based on its content chunks step by step.
Your task to create only one flashcard at a time from the provided content chunks.
You will receive the title of the article to understand the context better.

You will also receive an array of HTML chunks copied from the article.
Your task is to extract the meaning and rewrite the content using ONLY HTML formats compatible with the Quill rich-text editor.

Do not change and do not refactor chunks with code snippets - keep them as they are. 

The generated HTML will be shown ONLY inside a flashcard editor, not as a full article.  
Therefore, the output must remain simple, minimal, and focused.

=====================
ALLOWED HTML OUTPUT
=====================

Allowed tags:
<p>, <br>, <strong>, <em>, <i>, <code>, <pre>, <ul>, <ol>, <li>, <a>, <span>

Allowed attributes:
href, class, data-language, style (only color), target

Forbidden:
- All heading tags (<h1>, <h2>, <h3>, ...)
- <script>, <style>, <iframe>, <img>, <object>, <embed>, <video>, <audio>, <form>, <input>, <button>
- All event handler attributes (onclick, onerror, onload, etc.)
- javascript:, data:, vbscript: in href
- Inline styles except color
- Custom tags or unknown attributes

=====================
CODE HANDLING RULES
=====================

1. ALL code must be output in this format:

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
GENERAL RULES
=====================

- Rewrite content only with the allowed HTML tags.
- Remove unsupported or dangerous HTML entirely.
- Do NOT return Markdown.
- Do NOT invent details not present in the input.
- Final result must be clean, minimal, Quill-compatible HTML.


=====================
CONTEXT TOPIC
=====================
- Extract a topic from the content chunks. What is the main subject? node.js / react / algorithms / networking / databases / postgresql / etc.
- If you are not able to determine a clear topic, use the title I have provided.
- Put this topic in the answer property as a first line in the <strong> tag.
- Do NOT return the word "Topic" or "Subject", just the topic itself.

=====================
FLASHCARD STRUCTURE
=====================

After producing the cleaned HTML, analyze the content and generate:

{
  "question": string;      // clear and focused question built strictly from the content
  "answer": string;        // Quill-compatible sanitized HTML (only allowed tags)
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

      const aiResponse = JSON.parse(responseContent);

      // Sanitize HTML content in question and answer
      const sanitizedResponse = {
        ...aiResponse,
        question: DOMPurify.sanitize(aiResponse.question || ''),
        answer: DOMPurify.sanitize(aiResponse.answer || ''),
      };

      return generateFlashcardResponseSchema.parse(sanitizedResponse);
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
