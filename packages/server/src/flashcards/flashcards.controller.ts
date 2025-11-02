import { Body, Controller, Get, Post, UsePipes } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';
import { FlashcardsService } from './flashcards.service';
import { CreateFlashcardDto } from './dto/create-flashcard.dto';
import { GetLastFlashcardDocs } from './decorators/get-last-flashcard.docs.decorator';
import { FlashcardEntity } from './entities/flashcard.entity';

@ApiTags('Flashcards')
@UsePipes(ZodValidationPipe)
@Controller('flashcards')
export class FlashcardsController {
  constructor(private readonly flashcardsService: FlashcardsService) {}

  @Post()
  async createFlashcard(@Body() createDto: CreateFlashcardDto): Promise<void> {
    return this.flashcardsService.createFlashcard(createDto);
  }

  @Get('last')
  @GetLastFlashcardDocs()
  async getLastFlashcard(): Promise<FlashcardEntity | null> {
    return this.flashcardsService.findLast();
  }
}
