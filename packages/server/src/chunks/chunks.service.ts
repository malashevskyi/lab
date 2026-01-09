import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateChunksDto } from './dto/create-chunks.dto';
import { ChunkEntity } from './entities/chunk.entity';
import { AiChunkAdjusterPort } from '../ai/ports/ai-chunk-adjuster.port.js';

@Injectable()
export class ChunksService {
  constructor(
    @InjectRepository(ChunkEntity)
    private readonly chunksRepository: Repository<ChunkEntity>,
    private readonly aiChunkAdjuster: AiChunkAdjusterPort,
  ) {}

  /**
   * Persists multiple chunks in the database.
   * @param createChunksDto - The DTO containing an array of chunks to create
   * @returns Promise that resolves when chunks are saved
   */
  async createMany(createChunksDto: CreateChunksDto): Promise<void> {
    const chunks = await Promise.all(
      createChunksDto.chunks.map(async (chunk) => {
        let text = chunk.text;
        const lang = chunk.lang || 'en';

        // Adjust chunk with AI if requested
        if (createChunksDto.adjust) {
          text = await this.aiChunkAdjuster.adjustChunk(text, lang);
        }

        return this.chunksRepository.create({ text, lang });
      }),
    );

    await this.chunksRepository.save(chunks);
  }
}
