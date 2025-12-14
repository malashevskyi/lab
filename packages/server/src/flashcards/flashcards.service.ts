import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateFlashcardDto } from './dto/create-flashcard.dto';
import { UpdateFlashcardDto } from './dto/update-flashcard.dto';
import { FlashcardEntity } from './entities/flashcard.entity';
import { FlashcardGroupUrlEntity } from './entities/flashcard-group-url.entity';
import { AiService } from '../ai/ai.service';
import { TtsService } from '../tts/tts.service';
import { StacksService } from '../stacks/stacks.service';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { CreateFlashcardResponseType } from '@lab/types/assistant/flashcards/index.js';
import { GenerateAudioResponseDto } from './dto/generate-audio.response.dto';
import { startOfDay } from 'date-fns';

@Injectable()
export class FlashcardsService {
  constructor(
    @InjectRepository(FlashcardEntity)
    private readonly flashcardsRepository: Repository<FlashcardEntity>,
    @InjectRepository(FlashcardGroupUrlEntity)
    private readonly flashcardGroupUrlsRepository: Repository<FlashcardGroupUrlEntity>,
    private readonly aiService: AiService,
    private readonly ttsService: TtsService,
    private readonly stacksService: StacksService,
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
   * Returns all flashcard group URLs from the database.
   * Each row contains a single `id` column which is the URL string.
   */
  async getFlashcardGroupURLs(): Promise<string[]> {
    const rows = await this.flashcardGroupUrlsRepository.find({
      order: {
        id: 'ASC',
      },
    });

    return rows.map((r) => r.id);
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

  /**
   * Finds all flashcards for a specific source URL.
   * @param sourceUrl - The source URL to filter by
   * @returns {Promise<FlashcardEntity[]>} Array of flashcards for the given URL
   */
  async findBySourceUrl(sourceUrl: string): Promise<FlashcardEntity[]> {
    return this.flashcardsRepository.find({
      where: {
        sourceUrl,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  /**
   * Updates an existing flashcard's question, answer, or context.
   * When context is updated, it either updates the stack (case change) or switches to another stack.
   * @param id - The flashcard ID to update
   * @param updateData - The updated data
   * @returns {Promise<FlashcardEntity>} The updated flashcard entity
   */
  async updateFlashcard(
    id: string,
    updateData: UpdateFlashcardDto,
  ): Promise<FlashcardEntity | null> {
    const flashcard = await this.flashcardsRepository.findOne({
      where: { id },
    });

    if (!flashcard) {
      throw new Error(`Flashcard with ID "${id}" not found`);
    }

    const updateFields: Partial<FlashcardEntity> = {
      updatedAt: new Date().toISOString(),
    };

    if (updateData.question !== undefined)
      updateFields.question = updateData.question;
    if (updateData.answer !== undefined)
      updateFields.answer = updateData.answer;

    if (updateData.context !== undefined) {
      const oldContext = flashcard.context;
      const newContext = updateData.context;

      // Check if it's just a case change of the same stack
      if (oldContext.toLowerCase() === newContext.toLowerCase()) {
        // Case change - update the stack itself (affects all flashcards with this stack)
        await this.stacksService.update(oldContext, newContext);
        updateFields.context = newContext;
      } else {
        // Different stack - just update this flashcard's context
        // Create new stack if it doesn't exist
        const targetStack = await this.stacksService.findOrCreate(newContext);
        updateFields.context = targetStack.id;
      }
    }

    await this.flashcardsRepository.update(id, updateFields);

    return this.flashcardsRepository.findOne({ where: { id } });
  }

  async generateQuestionAudio(id: string): Promise<GenerateAudioResponseDto> {
    const flashcard = await this.flashcardsRepository.findOne({
      where: { id },
    });

    if (!flashcard) {
      throw new Error(`Flashcard with ID "${id}" not found`);
    }

    const { audioUrl } =
      await this.ttsService.generateAndUploadFlashcardQuestionAudio(
        flashcard.question,
        id,
      );

    await this.flashcardsRepository.update(id, {
      questionAudioUrl: audioUrl,
      updatedAt: new Date().toISOString(),
    });

    return { audioUrl };
  }

  async deleteFlashcard(id: string): Promise<void> {
    const flashcard = await this.flashcardsRepository.findOne({
      where: { id },
    });

    if (!flashcard) {
      throw new Error(`Flashcard with ID "${id}" not found`);
    }

    if (flashcard.questionAudioUrl) {
      await this.ttsService.deleteFlashcardQuestionAudio(id);
    }

    await this.flashcardsRepository.delete(id);
  }

  async countTodayFlashcards(): Promise<number> {
    const todayStart = startOfDay(new Date());

    const count = await this.flashcardsRepository.count({
      where: {
        createdAt: MoreThanOrEqual(todayStart.toISOString()),
      },
    });

    return count;
  }
}
