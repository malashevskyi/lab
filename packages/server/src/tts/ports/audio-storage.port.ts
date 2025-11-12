import type { UploadAudioResponse } from '@lab/types/assistant/tts/index.js';

export abstract class AudioStoragePort {
  abstract uploadAudio(
    buffer: Buffer,
    text: string,
  ): Promise<UploadAudioResponse>;
  abstract uploadFlashcardQuestionAudio(
    buffer: Buffer,
    flashcardId: string,
  ): Promise<UploadAudioResponse>;
}
