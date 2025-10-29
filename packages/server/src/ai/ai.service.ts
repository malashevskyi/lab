import { Injectable, UsePipes, ValidationPipe } from '@nestjs/common';
import { AiAnalysisPort } from './ports/ai-analysis.port.js';
import {
  AnalysisResponse,
  GenerateFlashcardResponse,
} from '@lab/types/deep-read/ai/index.js';
import { AiFlashcardGeneratorPort } from './ports/ai-generate-flashcard.port.js';

@Injectable()
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class AiService {
  constructor(
    private readonly aiAnalysisPort: AiAnalysisPort,
    private readonly aiFlashcardGeneratorPort: AiFlashcardGeneratorPort,
  ) {}

  /**
   * Analyzes selected text in context and returns structured analysis with audio.
   *
   * @param selectedText - Text to analyze.
   * @param context - Context for the text.
   * @returns AnalysisResponse with word and example details.
   */
  async analyzeText(
    selectedText: string,
    context: string,
  ): Promise<AnalysisResponse> {
    const structuredResponse = await this.aiAnalysisPort.getStructuredAnalysis(
      selectedText,
      context,
    );

    const analysisResult: AnalysisResponse = {
      word: {
        text: structuredResponse.normalizedText,
        transcription: structuredResponse.transcription,
        translation: structuredResponse.wordTranslation,
      },
      example: {
        adaptedSentence: structuredResponse.adaptedSentence,
        translation: structuredResponse.translation,
      },
    };

    return analysisResult;
  }

  generateFlashcard(chunks: string[]): Promise<GenerateFlashcardResponse> {
    return this.aiFlashcardGeneratorPort.generateFlashcardFromChunks(chunks);
  }
}
