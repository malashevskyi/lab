import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AppException } from '../shared/exceptions/AppException.js';
import { Repository } from 'typeorm';
import { CreateDictionaryExampleDto } from './dto/create-dictionary-example.dto.js';
import { DictionaryExample } from './entities/dictionary-example.entity.js';

@Injectable()
export class DictionaryExamplesService {
  constructor(
    @InjectRepository(DictionaryExample)
    private readonly exampleRepository: Repository<DictionaryExample>,
  ) {}

  /**
   * Creates a new example for a dictionary entry.
   * Prevents creation of duplicate examples (same sentence + same accent).
   * @param dto - The data for the new example.
   * @returns The newly created example entity.
   * @throws {ConflictException} If the example already exists.
   */
  async createDictionaryExample(
    dto: CreateDictionaryExampleDto,
  ): Promise<DictionaryExample> {
    const existingExample = await this.exampleRepository.findOneBy({
      example: dto.example,
      accent: dto.accent,
    });

    if (existingExample) {
      throw AppException.conflict(
        `Example for accent "${dto.accent}" in sentence "${dto.example}" already exists.`,
      );
    }

    const newExample = this.exampleRepository.create(dto);

    return this.exampleRepository.save(newExample);
  }
}
