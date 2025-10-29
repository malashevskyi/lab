import { Module } from '@nestjs/common';
import { AiController } from './ai.controller.js';
import { AiService } from './ai.service.js';
import { AiAnalysisPort } from './ports/ai-analysis.port.js';
import { AiFlashcardGeneratorPort } from './ports/ai-generate-flashcard.port.js';
import { OpenAiAdapter } from './adapters/openai.adapter.js';
import { OpenAiFlashcardAdapter } from './adapters/openai-flashcard.adapter.js';

@Module({
  imports: [],
  controllers: [AiController],
  providers: [
    AiService,
    {
      provide: AiAnalysisPort,
      useClass: OpenAiAdapter,
    },
    {
      provide: AiFlashcardGeneratorPort,
      useClass: OpenAiFlashcardAdapter,
    },
  ],
  exports: [AiService],
})
export class AiModule {}
