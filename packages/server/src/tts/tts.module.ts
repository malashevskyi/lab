import { Module } from '@nestjs/common';
import { TtsService } from './tts.service.js';
import { GoogleTtsAdapter } from './adapters/google-tts.adapter.js';
import { TextToSpeechPort } from './ports/tts.port.js';
import { AudioStoragePort } from './ports/audio-storage.port.js';
import { FirebaseStorageAdapter } from './adapters/firebase-storage.adapter.js';
import { TtsController } from './tts.controller.js';
import { AudioRecordsModule } from '../audio-records/audio-records.module.js';
import { ErrorsModule } from '../errors/errors.module.js';

@Module({
  imports: [AudioRecordsModule, ErrorsModule],
  providers: [
    TtsService,
    GoogleTtsAdapter,
    FirebaseStorageAdapter,
    {
      provide: TextToSpeechPort,
      useClass: GoogleTtsAdapter,
    },
    {
      provide: AudioStoragePort,
      useClass: FirebaseStorageAdapter,
    },
  ],
  exports: [TtsService],
  controllers: [TtsController],
})
export class TtsModule {}
