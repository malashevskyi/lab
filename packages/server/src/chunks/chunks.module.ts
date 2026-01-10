import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChunksController } from './chunks.controller';
import { ChunksService } from './chunks.service';
import { ChunkEntity } from './entities/chunk.entity';
import { AiModule } from '../ai/ai.module';
import { TtsModule } from '../tts/tts.module';

@Module({
  imports: [TypeOrmModule.forFeature([ChunkEntity]), AiModule, TtsModule],
  controllers: [ChunksController],
  providers: [ChunksService],
})
export class ChunksModule {}
