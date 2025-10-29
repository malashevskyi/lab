import { Body, Controller, Post, UsePipes } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';
import { FlashcardsService } from './flashcards.service';
import { CreateFlashcardDto } from './dto/create-flashcard.dto';
import { FlashcardEntity } from './entities/flashcard.entity';

@ApiTags('Flashcards')
@UsePipes(ZodValidationPipe)
@Controller('flashcards')
export class FlashcardsController {
  constructor(private readonly flashcardsService: FlashcardsService) {}

  @Post()
  async createFlashcard(
    @Body() createDto: CreateFlashcardDto,
  ): Promise<FlashcardEntity> {
    return this.flashcardsService.createFlashcard(createDto);
  }
}
