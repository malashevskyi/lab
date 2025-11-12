import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FlashcardsController } from './flashcards.controller';
import { FlashcardsService } from './flashcards.service';
import { FlashcardEntity } from './entities/flashcard.entity';
import { AiModule } from '../ai/ai.module';
import { TtsModule } from '../tts/tts.module';

@Module({
  imports: [TypeOrmModule.forFeature([FlashcardEntity]), AiModule, TtsModule],
  controllers: [FlashcardsController],
  providers: [FlashcardsService],
})
export class FlashcardsModule {}
