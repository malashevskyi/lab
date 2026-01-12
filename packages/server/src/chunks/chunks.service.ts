import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
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
        let chunkAudioExpiresAt: Date | null = null;
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

          // Set expiration date to 1 month from now
          chunkAudioExpiresAt = new Date();
          chunkAudioExpiresAt.setMonth(chunkAudioExpiresAt.getMonth() + 1);
        }

        return this.chunksRepository.create({
          text,
          lang,
          uk,
          chunkAudio,
          chunkAudioExpiresAt,
        });
      }),
    );

    await this.chunksRepository.save(chunks);
  }

  /**
   * Process existing chunks that don't have translation or audio.
   * This is an admin/temporary endpoint to populate existing data.
   * @returns statistics about processed chunks
   */
  async processExistingChunks(): Promise<{
    total: number;
    processed: number;
    errors: number;
  }> {
    // Find chunks without translation or audio
    const chunksToProcess = await this.chunksRepository.find({
      where: [{ uk: IsNull() }, { chunkAudio: IsNull() }],
    });

    let processed = 0;
    let errors = 0;

    for (const chunk of chunksToProcess) {
      try {
        // Process with AI to get adjusted text and translation
        const { adjustedText, translation } =
          await this.aiChunkProcessor.processChunk(chunk.text, chunk.lang);

        // Generate audio for the adjusted text
        const audioBuffer = await this.ttsPort.generateAudioBuffer(
          adjustedText,
          chunk.lang,
        );
        const { audioUrl } = await this.audioStoragePort.uploadAudio(
          audioBuffer,
          adjustedText,
        );

        // Set expiration date to 1 month from now
        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + 1);

        // Update the chunk with new data
        chunk.text = adjustedText;
        chunk.uk = translation;
        chunk.chunkAudio = audioUrl;
        chunk.chunkAudioExpiresAt = expiresAt;

        await this.chunksRepository.save(chunk);
        processed++;
      } catch (error) {
        console.error(`Failed to process chunk ${chunk.id}:`, error);
        errors++;
      }
    }

    return {
      total: chunksToProcess.length,
      processed,
      errors,
    };
  }
}
