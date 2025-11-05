import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateFlashcardDto } from './dto/create-flashcard.dto';
import { FlashcardEntity } from './entities/flashcard.entity';
import { AiService } from '../ai/ai.service';
import { Repository } from 'typeorm';
import { CreateFlashcardResponseType } from '@lab/types/deep-read/flashcards/index.js';

@Injectable()
export class FlashcardsService {
  constructor(
    @InjectRepository(FlashcardEntity)
    private readonly flashcardsRepository: Repository<FlashcardEntity>,
    private readonly aiService: AiService,
  ) {}

  /**
   * Persists a flashcard in the database after validating its payload.
   * If ID is provided, deletes the existing flashcard before creating a new one.
   * @param flashcardData {@link CreateFlashcardDto}
   * @returns flashcard id {@link CreateFlashcardResponseType}
   */
  async createFlashcard({
    title,
    chunks,
    sourceUrl,
    id,
  }: CreateFlashcardDto): Promise<CreateFlashcardResponseType> {
    if (id) {
      await this.flashcardsRepository.delete(id);
    }

    const generatedFlashcard = await this.aiService.generateFlashcard(
      title,
      chunks,
    );

    const newFlashcard = this.flashcardsRepository.create({
      ...generatedFlashcard,
      sourceUrl,
      nextReviewDate: new Date().toISOString(),
      lastInterval: null,
    });

    const savedFlashcard = await this.flashcardsRepository.save(newFlashcard);
    return { id: savedFlashcard.id };
  }

  /**
   * Finds the most recently created flashcard.
   * @returns {Promise<FlashcardEntity>} The last created flashcard entity.
   * @throws {NotFoundException} If no flashcards are found in the database.
   */
  async findLast(): Promise<FlashcardEntity | null> {
    const lastFlashcardArray = await this.flashcardsRepository.find({
      order: {
        createdAt: 'DESC',
      },
      take: 1,
    });

    const [lastFlashcard] = lastFlashcardArray;

    return lastFlashcard || null;
  }
}
