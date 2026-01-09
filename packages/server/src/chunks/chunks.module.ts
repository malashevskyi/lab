import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChunksController } from './chunks.controller';
import { ChunksService } from './chunks.service';
import { ChunkEntity } from './entities/chunk.entity';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [TypeOrmModule.forFeature([ChunkEntity]), AiModule],
  controllers: [ChunksController],
  providers: [ChunksService],
})
export class ChunksModule {}
