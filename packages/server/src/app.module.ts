import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AiModule } from './ai/ai.module.js';
import { ConfigModule } from '@nestjs/config';
import { TtsModule } from './tts/tts.module.js';
import { validationSchema } from './config/validation.schema.js';
import getTypeOrmConfig from './shared/configs/typeorm.config.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AudioRecordsModule } from './audio-records/audio-records.module.js';
import { DictionaryEntriesModule } from './dictionary-entries/dictionary-entries.module.js';
import { DictionaryExamplesModule } from './dictionary-examples/dictionary-examples.module.js';
import { FlashcardsModule } from './flashcards/flashcards.module';
import { StacksModule } from './stacks/stacks.module';
import { ChunksModule } from './chunks/chunks.module';
import ormConfig from './shared/configs/orm.config.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [ormConfig],
      validate: (config) => {
        const result = validationSchema.safeParse(config);

        if (result.success === false) {
          const errorMessages = result.error.issues
            .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
            .join('\n');
          throw new Error(`Environment validation failed:\n${errorMessages}`);
        }

        return result.data;
      },
    }),
    TypeOrmModule.forRootAsync(getTypeOrmConfig()),
    AiModule,
    TtsModule,
    AudioRecordsModule,
    DictionaryEntriesModule,
    DictionaryExamplesModule,
    FlashcardsModule,
    StacksModule,
    ChunksModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
