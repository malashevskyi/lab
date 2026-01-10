import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { AppException } from '../../shared/exceptions/AppException.js';
import { DEFAULT_LANGUAGE } from '../../shared/constants/languages.js';
import {
  AiChunkProcessorPort,
  AdjustedChunkResultSchema,
  type AdjustedChunkResult,
} from '../ports/ai-chunk-adjuster.port.js';

const ChunkProcessorPrompt = `You are an assistant that helps learners save text snippets for studying English.

Your task: 
1. Adjust the given text snippet so it becomes a complete, grammatically correct sentence suitable for learning.
2. Translate the adjusted sentence to Ukrainian.

Adjustment Rules:
1. Add capitalization (uppercase first letter) if missing.
2. Add pronouns, articles, or subjects at the beginning if the snippet starts mid-sentence.
3. Add punctuation (period, question mark, exclamation mark, etc.) at the end if missing.
4. Make minimal adjustments to create a standalone, grammatically complete sentence.
5. Do NOT change the core words, their order, or the meaning.
6. Do NOT rephrase, rewrite unnecessarily.
7. Ensure the result is a natural, learnable English sentence.

Translation Rules:
1. Translate the ADJUSTED sentence to Ukrainian.
2. Keep the translation natural and accurate.
3. Preserve the meaning and tone.

Return a JSON object with:
- adjustedText: the adjusted English sentence
- translation: the Ukrainian translation of the adjusted sentence`;

@Injectable()
export class OpenAiChunkProcessorAdapter implements AiChunkProcessorPort {
  private readonly openai: OpenAI;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.getOrThrow<string>('OPENAI_API_KEY');
    const projectId = this.configService.get<string>('OPENAI_PROJECT_ID');
    this.openai = new OpenAI({ apiKey, project: projectId || undefined });
  }

  async processChunk(
    chunk: string,
    lang = DEFAULT_LANGUAGE,
  ): Promise<AdjustedChunkResult> {
    try {
      const openAiModel = this.configService.getOrThrow<string>('OPENAI_MODEL');

      const userPrompt = `Language: ${lang}
Text snippet: "${chunk}"

Adjust it to be a complete sentence and translate to Ukrainian:`;

      const completion = await this.openai.chat.completions.create({
        model: openAiModel,
        messages: [
          { role: 'system', content: ChunkProcessorPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
        max_tokens: 300,
      });

      const responseContent = completion.choices[0]?.message.content;
      if (!responseContent) {
        throw new Error('OpenAI returned an empty response content.');
      }

      return AdjustedChunkResultSchema.parse(JSON.parse(responseContent));
    } catch (error) {
      throw AppException.aiResponseInvalid(
        'Failed to process chunk with OpenAI.',
        error,
      );
    }
  }
}
