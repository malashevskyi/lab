import type { UploadAudioResponse } from '@lab/types/deep-read/tts/index.js';

export abstract class AudioStoragePort {
  abstract uploadAudio(
    buffer: Buffer,
    text: string,
  ): Promise<UploadAudioResponse>;
}
