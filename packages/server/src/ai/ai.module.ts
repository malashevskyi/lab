import { Module } from '@nestjs/common';
import { AiController } from './ai.controller.js';
import { AiService } from './ai.service.js';
import { AiAnalysisPort } from './ports/ai-analysis.port.js';
import { AiFlashcardGeneratorPort } from './ports/ai-generate-flashcard.port.js';
import { AiChunkAdjusterPort } from './ports/ai-chunk-adjuster.port.js';
import { OpenAiAdapter } from './adapters/openai.adapter.js';
import { OpenAiFlashcardAdapter } from './adapters/openai-flashcard.adapter.js';
import { OpenAiChunkAdjusterAdapter } from './adapters/openai-chunk-adjuster.adapter.js';
import { StacksModule } from '../stacks/stacks.module';

@Module({
  imports: [StacksModule],
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
    {
      provide: AiChunkAdjusterPort,
      useClass: OpenAiChunkAdjusterAdapter,
    },
  ],
  exports: [
    AiService,
    AiAnalysisPort,
    AiFlashcardGeneratorPort,
    AiChunkAdjusterPort,
  ],
})
export class AiModule {}
