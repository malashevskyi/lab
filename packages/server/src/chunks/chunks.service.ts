import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateChunksDto } from './dto/create-chunks.dto';
import { ChunkEntity } from './entities/chunk.entity';
import { AiChunkProcessorPort } from '../ai/ports/ai-chunk-adjuster.port.js';
import { TextToSpeechPort } from '../tts/ports/tts.port.js';
import { AudioStoragePort } from '../tts/ports/audio-storage.port.js';
import { DEFAULT_LANGUAGE } from '../shared/constants/languages.js';

@Injectable()
export class ChunksService {
  constructor(
    @InjectRepository(ChunkEntity)
    private readonly chunksRepository: Repository<ChunkEntity>,
    private readonly aiChunkProcessor: AiChunkProcessorPort,
    private readonly ttsPort: TextToSpeechPort,
    private readonly audioStoragePort: AudioStoragePort,
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
        let uk: string | null = null;
        let chunkAudio: string | null = null;
        const lang = chunk.lang || DEFAULT_LANGUAGE;

        // Process chunk with AI if requested (adjust + translate + generate audio)
        if (createChunksDto.adjust) {
          const { adjustedText, translation } =
            await this.aiChunkProcessor.processChunk(text, lang);

          text = adjustedText;
          uk = translation;

          // Generate audio for the adjusted English text
          const audioBuffer = await this.ttsPort.generateAudioBuffer(
            adjustedText,
            lang,
          );
          const { audioUrl } = await this.audioStoragePort.uploadAudio(
            audioBuffer,
            adjustedText,
          );
          chunkAudio = audioUrl;
        }

        return this.chunksRepository.create({ text, lang, uk, chunkAudio });
      }),
    );

    await this.chunksRepository.save(chunks);
  }
}
