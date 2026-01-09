import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { AppException } from '../../shared/exceptions/AppException.js';
import { AiChunkAdjusterPort } from '../ports/ai-chunk-adjuster.port.js';

const ChunkAdjusterPrompt = `You are an assistant that helps learners save text snippets for studying English.

Your task: adjust the given text snippet so it becomes a complete, grammatically correct sentence suitable for learning.

Rules:
1. Add capitalization (uppercase first letter) if missing.
2. Add pronouns, articles, or subjects at the beginning if the snippet starts mid-sentence.
3. Add punctuation (period, question mark, exclamation mark, etc.) at the end if missing.
4. Make minimal adjustments to create a standalone, grammatically complete sentence.
5. Do NOT change the core words, their order, or the meaning.
6. Do NOT rephrase, rewrite, or translate.
7. Do NOT add explanations or extra context.

Return ONLY the adjusted text, nothing else.`;

@Injectable()
export class OpenAiChunkAdjusterAdapter implements AiChunkAdjusterPort {
  private readonly openai: OpenAI;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.getOrThrow<string>('OPENAI_API_KEY');
    const projectId = this.configService.get<string>('OPENAI_PROJECT_ID');
    this.openai = new OpenAI({ apiKey, project: projectId || undefined });
  }

  async adjustChunk(chunk: string, lang = 'en'): Promise<string> {
    try {
      const openAiModel = this.configService.getOrThrow<string>('OPENAI_MODEL');

      const userPrompt = `Language: ${lang}
Text snippet: "${chunk}"

Adjust it to be a complete sentence:`;

      const completion = await this.openai.chat.completions.create({
        model: openAiModel,
        messages: [
          { role: 'system', content: ChunkAdjusterPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 200,
      });

      const adjustedText = completion.choices[0]?.message.content?.trim();

      if (!adjustedText) {
        throw new Error('OpenAI returned an empty response.');
      }

      return adjustedText;
    } catch (error) {
      throw AppException.aiResponseInvalid(
        'Failed to adjust chunk with OpenAI.',
        error,
      );
    }
  }
}
