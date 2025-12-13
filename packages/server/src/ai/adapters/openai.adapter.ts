import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { AppException } from 'src/shared/exceptions/AppException.js';
import {
  AiAnalysisPort,
  AiStructuredResponse,
  AiStructuredResponseSchema,
} from '../ports/ai-analysis.port.js';

const OpenAIPrompt = `You are an advanced language analysis tool. Your task is to analyze a selected text/word/phrase within a given context.
Respond ONLY with a valid JSON object in the following format:
{
  "normalizedText": "string",
        //  "The text in its correct, base dictionary form. Your primary goal is to provide the dictionary lookup form of the word.
RULE 1: Default to lowercase. For regular words that are capitalized only because they start a sentence or for stylistic reasons, you MUST convert them to lowercase.
RULE 2: Preserve capitalization ONLY if it is semantically critical. This applies to: a) Universally recognized proper nouns that are ALWAYS capitalized (e.g., 'January', 'Google', 'London'). b) Words where capitalization changes the meaning (e.g., 'May' the month vs. 'may' the verb). Use the provided context to determine if the capitalization is critical.
EXAMPLES of correct behavior:
Input: 'Police' (at start of sentence) -> Output: 'police'
Input: 'Republic' (in 'Republic of Moldova') -> Output: 'republic'
Input: 'Republic of Moldova' -> Output: 'Republic of Moldova'
Input: 'May' (in 'May I help you?') -> Output: 'may'
Input: 'May' (in 'the month of May') -> Output: 'May'
Input: 'GOOGLE' (stylistic) -> Output: 'Google'",
        // Never change the tense of the word!
  "transcription": "string",
        // The phonetic transcription of the normalized text, e.g., |səˈvɪr| |skwiːld| |dɪˈlaɪt| |dʌɡ| |ˈdiːpər| |ˈstɑːmpt| |ˈdʒəʊltɪd| |kənˈfjuːzd| |ˈskwɜːrəl| - these are correct patterns, the transcription must starts with | sign and must ends with | signs. Not \\ sign!!! Not / sign!!!.
        // Never use dots in transcriptions.
        // IGNORE YOUR INTERNAL IPA! To show e sound use e symbol instead of ɛ! Replace all ɛ symbols to e!
        // Must be only one transcription in the context, don't provide multiple transcriptions.
  "wordTranslation": "string"
        // The direct translation of the 'normalizedText' into Ukrainian.
        // Must be only one translation in the context
  "adaptedSentence": "string"
        // A clear, simple example sentence in the context I have provided that includes the text/word/phase I have provided. The sentence can be slightly modified to fit the context naturally, but it should not change the meaning of the text/word/phase. Or it can be the same sentence from the context if it grammatically and naturally fits.,
  "translation": "string"
        // The translation of the adapted sentence into Ukrainian in the provided context.
}`;

@Injectable()
export class OpenAiAdapter implements AiAnalysisPort {
  private readonly openai: OpenAI;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.getOrThrow<string>('OPENAI_API_KEY');
    const projectId = this.configService.get<string>('OPENAI_PROJECT_ID');
    this.openai = new OpenAI({ apiKey, project: projectId || undefined });
  }

  async getStructuredAnalysis(
    text: string,
    context: string,
  ): Promise<AiStructuredResponse> {
    try {
      const openAiModel = this.configService.getOrThrow<string>('OPENAI_MODEL');

      const userPrompt = `Selected Text: "${text}"\nContext: "${context}"`;

      const completion = await this.openai.chat.completions.create({
        model: openAiModel,
        messages: [
          { role: 'system', content: OpenAIPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
      });

      const responseContent = completion.choices[0]?.message.content;
      if (!responseContent) {
        throw new Error('OpenAI returned an empty response content.');
      }

      return AiStructuredResponseSchema.parse(JSON.parse(responseContent));
    } catch (error) {
      throw AppException.aiResponseInvalid(
        'Failed to get a valid structured analysis from OpenAI.',
        error,
      );
    }
  }
}
