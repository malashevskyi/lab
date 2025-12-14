import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FlashcardsController } from './flashcards.controller';
import { FlashcardsService } from './flashcards.service';
import { FlashcardEntity } from './entities/flashcard.entity';
import { FlashcardGroupUrlEntity } from './entities/flashcard-group-url.entity';
import { AiModule } from '../ai/ai.module';
import { TtsModule } from '../tts/tts.module';
import { StacksModule } from '../stacks/stacks.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FlashcardEntity, FlashcardGroupUrlEntity]),
    AiModule,
    TtsModule,
    StacksModule,
  ],
  controllers: [FlashcardsController],
  providers: [FlashcardsService],
})
export class FlashcardsModule {}
