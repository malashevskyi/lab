import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateFlashcardDto } from './dto/create-flashcard.dto';
import { FlashcardEntity } from './entities/flashcard.entity';
import { AiService } from 'src/ai/ai.service';
import { Repository } from 'typeorm';

@Injectable()
export class FlashcardsService {
  constructor(
    @InjectRepository(FlashcardEntity)
    private readonly flashcardsRepository: Repository<FlashcardEntity>,
    private readonly aiService: AiService,
  ) {}

  /**
   * Persists a flashcard in the database after validating its payload.
   * @param flashcardData {@link CreateFlashcardDto}
   * @returns The persisted {@link FlashcardEntity} instance.
   */
  async createFlashcard({
    title,
    chunks,
    sourceUrl,
  }: CreateFlashcardDto): Promise<FlashcardEntity> {
    const generatedFlashcard = await this.aiService.generateFlashcard(
      title,
      chunks,
    );

    const newFlashcard = this.flashcardsRepository.create({
      ...generatedFlashcard,
      sourceUrl,
    });

    return this.flashcardsRepository.save(newFlashcard);
  }
}
