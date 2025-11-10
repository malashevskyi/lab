import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { googleServiceAccountSchema } from '@lab/types/assistant/tts/index.js';
import { TextToSpeechPort } from '../ports/tts.port.js';
import { ErrorService } from '../../errors/errors.service.js';
import { AppErrorCode } from '../../shared/exceptions/AppErrorCode.js';

const AUDIO_ENCODING = 'MP3' as const;

enum LanguageCodeMap {
  en = 'en-US',
}
enum VoiceNameMap {
  en = 'en-US-Standard-C',
}

@Injectable()
export class GoogleTtsAdapter implements OnModuleInit, TextToSpeechPort {
  private ttsClient: TextToSpeechClient;

  constructor(
    private readonly configService: ConfigService,
    private readonly errorService: ErrorService,
  ) {}

  onModuleInit() {
    const credentialsJson = this.configService.get<string>(
      'GOOGLE_CREDENTIALS_JSON',
    );

    if (!credentialsJson) {
      throw new Error('GOOGLE_CREDENTIALS_JSON is not configured.');
    }
    const credentials = googleServiceAccountSchema.parse(
      JSON.parse(credentialsJson),
    );

    this.ttsClient = new TextToSpeechClient({ credentials });
  }

  async generateAudioBuffer(text: string): Promise<Buffer> {
    try {
      const [ttsResponse] = await this.ttsClient.synthesizeSpeech({
        input: { text },
        voice: { languageCode: LanguageCodeMap.en, name: VoiceNameMap.en },
        audioConfig: { audioEncoding: AUDIO_ENCODING },
      });

      if (!ttsResponse.audioContent) {
        throw new Error('Failed to generate audio content from Google TTS.');
      }
      const audioBuffer = Buffer.from(ttsResponse.audioContent);

      return audioBuffer;
    } catch (error) {
      this.errorService.handle(
        AppErrorCode.TTS_GENERATION_FAILED,
        `Failed to generate audio for text: "${text}"`,
        error,
      );
    }
  }
}
