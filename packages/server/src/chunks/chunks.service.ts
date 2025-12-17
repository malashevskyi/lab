import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateChunksDto } from './dto/create-chunks.dto';
import { ChunkEntity } from './entities/chunk.entity';

@Injectable()
export class ChunksService {
  constructor(
    @InjectRepository(ChunkEntity)
    private readonly chunksRepository: Repository<ChunkEntity>,
  ) {}

  /**
   * Persists multiple chunks in the database.
   * @param createChunksDto - The DTO containing an array of chunks to create
   * @returns Promise that resolves when chunks are saved
   */
  async createMany(createChunksDto: CreateChunksDto): Promise<void> {
    const chunks = createChunksDto.chunks.map((chunk) =>
      this.chunksRepository.create({
        text: chunk.text,
        lang: chunk.lang || 'en',
      }),
    );

    await this.chunksRepository.save(chunks);
  }
}
