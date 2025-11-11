import { Module } from '@nestjs/common';
import { AudioRecordsService } from './audio-records.service.js';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module.js';
import { AudioRecord } from './entities/audio-record.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([AudioRecord])],
  providers: [AudioRecordsService],
  exports: [AudioRecordsService],
})
export class AudioRecordsModule {}
