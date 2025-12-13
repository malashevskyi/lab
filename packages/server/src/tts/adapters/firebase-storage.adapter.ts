import {
  googleServiceAccountSchema,
  type GoogleCredentials,
  type UploadAudioResponse,
} from '@lab/types/assistant/tts/index.js';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { App } from 'firebase-admin/app';
import { getStorage, Storage } from 'firebase-admin/storage';
import { AppException } from '../../shared/exceptions/AppException.js';
import { AppErrorCode } from '../../shared/exceptions/AppErrorCode.js';
import { AudioStoragePort } from '../ports/audio-storage.port.js';

const BUCKET_DIRECTORY = 'audio';
const FLASHCARD_QUESTIONS_DIRECTORY = 'flashcard-questions';

const getFirebaseCredentials = (
  serviceAccountString: string,
): GoogleCredentials => {
  try {
    return googleServiceAccountSchema.parse(JSON.parse(serviceAccountString));
  } catch {
    throw new Error('Invalid FIREBASE_SERVICE_ACCOUNT_KEY_JSON format.');
  }
};

@Injectable()
export class FirebaseStorageAdapter implements OnModuleInit, AudioStoragePort {
  private readonly logger = new Logger(FirebaseStorageAdapter.name);
  private bucketName: string;
  private storage: Storage;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    try {
      const serviceAccountJson = this.configService.getOrThrow<string>(
        'FIREBASE_SERVICE_ACCOUNT_KEY_JSON',
      );
      const bucketName = this.configService.getOrThrow<string>(
        'FIREBASE_STORAGE_BUCKET',
      );
      const projectName = this.configService.getOrThrow<string>('PROJECT_NAME');

      const credentials = getFirebaseCredentials(serviceAccountJson);

      this.bucketName = bucketName;

      let app: App;

      const existingApp = admin.apps.find((app) => app?.name === projectName);

      if (existingApp) {
        app = existingApp;
        this.logger.log(`Using existing Firebase App: "${projectName}"`);
      } else {
        app = admin.initializeApp(
          {
            credential: admin.credential.cert(
              /**
               * The admin.credential.cert() expects the strict 'admin.ServiceAccount' type.
               * However, the actual data we have is the raw Google Service Account JSON object
               */
              credentials as unknown as admin.ServiceAccount,
            ),
            storageBucket: this.bucketName,
          },
          projectName,
        );
        this.logger.log(`Firebase App "${projectName}" initialized.`);
      }

      this.storage = getStorage(app);
      this.logger.log('Firebase Storage client initialized successfully.');
    } catch (error) {
      this.logger.error('Failed to initialize Firebase Admin SDK', error);
      throw error;
    }
  }

  private async deleteIfExists(storagePath: string): Promise<void> {
    try {
      const file = this.storage.bucket(this.bucketName).file(storagePath);
      const [exists] = await file.exists();
      if (exists) await file.delete();
    } catch (error) {
      throw AppException.create(
        AppErrorCode.AUDIO_DELETION_FAILED,
        `Failed to delete audio from storage at path: "${storagePath}"`,
        error,
      );
    }
  }

  private async saveAndGetSignedUrl(
    buffer: Buffer,
    storagePath: string,
  ): Promise<{ audioUrl: string; expiresAt: string }> {
    try {
      const file = this.storage.bucket(this.bucketName).file(storagePath);
      await this.deleteIfExists(storagePath);

      await file.save(buffer, {
        metadata: { contentType: 'audio/mpeg' },
        resumable: false,
      });

      const oneMonthFromNow = new Date();
      oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);

      const [audioUrl] = await file.getSignedUrl({
        action: 'read',
        expires: oneMonthFromNow,
      });

      return { audioUrl, expiresAt: oneMonthFromNow.toISOString() };
    } catch (error) {
      throw AppException.create(
        AppErrorCode.AUDIO_RETRIEVAL_FAILED,
        `Failed to retrieve audio from storage at path: "${storagePath}"`,
        error,
      );
    }
  }

  /**
   * Uploads an audio file to Firebase Storage and returns a signed URL.
   * @param buffer - The audio file buffer to upload.
   * @param text - A text string used to generate the file name.
   * @returns A promise resolving to an object containing the public URL and storage path.
   * @throws {AppError} If the upload or URL generation fails.
   */
  async uploadAudio(
    buffer: Buffer,
    text: string,
  ): Promise<UploadAudioResponse> {
    try {
      const fileName = `${text.replace(/\s/g, '_')}.mp3`;
      const storagePath = `${BUCKET_DIRECTORY}/${fileName}`;
      const { audioUrl, expiresAt } = await this.saveAndGetSignedUrl(
        buffer,
        storagePath,
      );

      this.logger.log(`Successfully uploaded file: ${storagePath}`);

      return {
        audioUrl,
        storagePath,
        expiresAt,
      };
    } catch (error) {
      throw AppException.create(
        AppErrorCode.AUDIO_UPLOAD_FAILED,
        `Failed to upload audio to storage for text: "${text}"`,
        error,
      );
    }
  }

  async uploadFlashcardQuestionAudio(
    buffer: Buffer,
    flashcardId: string,
  ): Promise<UploadAudioResponse> {
    try {
      const fileName = `${flashcardId}.mp3`;
      const storagePath = `${FLASHCARD_QUESTIONS_DIRECTORY}/${fileName}`;

      const { audioUrl, expiresAt } = await this.saveAndGetSignedUrl(
        buffer,
        storagePath,
      );

      this.logger.log(
        `Successfully uploaded flashcard question audio: ${storagePath}`,
      );

      return {
        audioUrl,
        storagePath,
        expiresAt,
      };
    } catch (error) {
      throw AppException.create(
        AppErrorCode.AUDIO_UPLOAD_FAILED,
        `Failed to upload flashcard question audio for ID: "${flashcardId}"`,
        error,
      );
    }
  }

  async deleteFlashcardQuestionAudio(flashcardId: string): Promise<void> {
    try {
      const fileName = `${flashcardId}.mp3`;
      const storagePath = `${FLASHCARD_QUESTIONS_DIRECTORY}/${fileName}`;
      await this.deleteIfExists(storagePath);

      this.logger.log(
        `Successfully deleted flashcard question audio: ${storagePath}`,
      );
    } catch (error) {
      throw AppException.create(
        AppErrorCode.AUDIO_DELETION_FAILED,
        `Failed to delete flashcard question audio for ID: "${flashcardId}"`,
        error,
      );
    }
  }
}
